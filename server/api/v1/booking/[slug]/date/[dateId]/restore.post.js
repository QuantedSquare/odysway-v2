import { defineEventHandler, createError } from 'h3'

// Restauration d'une date supprimée + de ses enfants en cascade.
//
// On ne remonte QUE les enfants portant deleted_reason = 'cascade_travel_date'.
// Une réservation que l'opérateur avait supprimée individuellement AVANT la
// suppression de la date garde la raison 'manual' (softDelete.remove() filtre
// sur deleted = false et n'écrase donc jamais un tombstone existant) et reste
// supprimée — c'est le comportement attendu.

const CHILD_TABLES = ['booked_dates', 'date_notes', 'date_attachments', 'date_invoices']

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { data: travelDate, error: fetchError } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', true)
    .maybeSingle()

  if (fetchError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Aucune date supprimée à restaurer pour ce slug' })
  }

  // --- Détection de conflits, AVANT toute écriture -------------------------
  // Point clé : une réservation dont le deal a été ré-assigné ailleurs ne PEUT
  // pas être ressuscitée par erreur. UNIQUE(deal_id) fait que la ré-assignation
  // a ressuscité cette même ligne physique et changé son travel_date_id, donc
  // le filtre de restauration ci-dessous l'exclut déjà. Le filtre s'auto-protège
  // — mais il faut quand même le signaler à l'opérateur.
  const conflicts = []
  const { data: logRows } = await supabase
    .from('date_activity_log')
    .select('changes')
    .eq('travel_date_id', dateId)
    .eq('action', 'date_deleted')
    .order('created_at', { ascending: false })
    .limit(1)

  const dealIds = logRows?.[0]?.changes?.deal_ids || []
  if (dealIds.length) {
    const { data: movedRows } = await supabase
      .from('booked_dates')
      .select('id, deal_id, travel_date_id, deleted, travel_dates(travel_slug)')
      .in('deal_id', dealIds)
    for (const row of movedRows || []) {
      if (row.travel_date_id !== dateId || row.deleted === false) {
        conflicts.push({
          type: 'booking_reassigned',
          deal_id: row.deal_id,
          booked_id: row.id,
          travel_date_id: row.travel_date_id,
          travel_slug: row.travel_dates?.travel_slug || null,
        })
      }
    }
  }

  // Avertissement (non bloquant) : une date active a été créée entre-temps pour
  // le même voyage au même départ.
  const { data: twin } = await supabase
    .from('travel_dates')
    .select('id')
    .eq('travel_slug', travelDate.travel_slug)
    .eq('departure_date', travelDate.departure_date)
    .eq('deleted', false)
    .maybeSingle()
  if (twin) {
    conflicts.push({ type: 'duplicate_active_date', travel_date_id: twin.id, travel_slug: travelDate.travel_slug })
  }

  // --- Restauration -------------------------------------------------------
  const restoredParent = await softDelete.restore('travel_dates', q => q.eq('id', dateId))
  if (restoredParent.error) {
    throw createError({ statusCode: 500, statusMessage: restoredParent.error })
  }

  const restored = {}
  for (const table of CHILD_TABLES) {
    const res = await softDelete.restore(table, q => q
      .eq('travel_date_id', dateId)
      .eq('deleted_reason', softDelete.REASONS.CASCADE_TRAVEL_DATE), {
      select: table === 'booked_dates' ? 'id, deal_id, booked_places' : 'id',
    })
    if (res.error) {
      throw createError({ statusCode: 500, statusMessage: `${table}: ${res.error}` })
    }
    restored[table] = res.count
    if (table === 'booked_dates') restored.booked_rows = res.rows
  }

  // booked_seat est périmé depuis la suppression : recalcul obligatoire.
  const recompute = await booking.recomputeBookedSeatAndStatus(dateId)
  if (recompute?.error) {
    throw createError({ statusCode: 500, statusMessage: recompute.error })
  }

  // Le deal de départ (pipeline 4) a été supprimé dans AC et n'est pas
  // récupérable. On ne le recrée PAS automatiquement — ça spammerait le
  // pipeline 4 à chaque restauration. Le BMS propose un bouton câblé sur
  // l'endpoint assign-departure-deal existant.
  const departureDealNeedsRecreation = (restored.booked_rows || [])
    .some(r => Number(r.booked_places || 0) > 0)

  await logDateActivity(dateId, bookingUser, 'date_restored', {
    restored: {
      booked_dates: restored.booked_dates,
      date_notes: restored.date_notes,
      date_attachments: restored.date_attachments,
      date_invoices: restored.date_invoices,
    },
    conflicts,
  })

  return {
    success: true,
    restored: {
      booked_dates: restored.booked_dates,
      date_notes: restored.date_notes,
      date_attachments: restored.date_attachments,
      date_invoices: restored.date_invoices,
    },
    conflicts,
    departureDealNeedsRecreation,
    booked_seat: recompute.booked_seat,
    status: recompute.status,
  }
})
