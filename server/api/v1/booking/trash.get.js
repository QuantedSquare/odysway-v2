import { defineEventHandler, getQuery, createError } from 'h3'

// Corbeille du BMS : tout ce qui est soft-deleted, sur les trois tables qui
// portent des données métier restaurables.
//
// Voir supabase/migrations/20260801090000_soft_delete.sql et
// server/utils/softDelete.js. Les colonnes d'audit (deleted_at / deleted_by /
// deleted_reason) sont renvoyées telles quelles : c'est ce qui permet à
// l'opérateur de comprendre POURQUOI une ligne a disparu (action manuelle,
// cascade d'une date, deal passé « Perdu » côté ActiveCampaign…).

const MAX_ROWS = 200

const AUDIT = 'deleted, deleted_at, deleted_by, deleted_reason, deleted_batch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { type = 'all', limit } = getQuery(event)
  const max = Math.min(Number(limit) || MAX_ROWS, MAX_ROWS)
  const wants = t => type === 'all' || type === t

  const result = { travel_dates: [], booked_dates: [], deals: [] }

  // --- travel_dates ------------------------------------------------------
  if (wants('travel_dates')) {
    const { data, error } = await supabase
      .from('travel_dates')
      .select(`id, travel_slug, departure_date, return_date, booked_seat, max_travelers, published, ${AUDIT}`)
      .eq('deleted', true)
      .order('deleted_at', { ascending: false })
      .limit(max)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    result.travel_dates = data || []
  }

  // --- booked_dates ------------------------------------------------------
  // L'embed travel_dates(...) sert à deux choses : afficher le voyage concerné,
  // et savoir si la date parente est elle-même supprimée — auquel cas la
  // restauration de la réservation seule est refusée (409 RESTORE_PARENT_DELETED),
  // il faut restaurer la date d'abord.
  if (wants('booked_dates')) {
    const { data, error } = await supabase
      .from('booked_dates')
      .select(`id, deal_id, travel_date_id, booked_places, is_option, payment_type, ${AUDIT}, travel_dates(id, travel_slug, departure_date, deleted)`)
      .eq('deleted', true)
      .order('deleted_at', { ascending: false })
      .limit(max)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    // Pas de FK entre booked_dates.deal_id et activecampaign_deals.id : PostgREST
    // ne peut pas inférer la relation, on joint à la main (même approche que
    // server/utils/margins.js).
    const rows = data || []
    const dealIds = [...new Set(rows.map(r => r.deal_id).filter(Boolean))]
    const dealsById = new Map()
    if (dealIds.length) {
      const { data: deals } = await supabase
        .from('activecampaign_deals')
        .select('id, title, status, total_value, deleted')
        .in('id', dealIds)
      for (const d of deals || []) dealsById.set(Number(d.id), d)
    }

    result.booked_dates = rows.map((r) => {
      const deal = dealsById.get(Number(r.deal_id)) || null
      return {
        ...r,
        travel_slug: r.travel_dates?.travel_slug || null,
        departure_date: r.travel_dates?.departure_date || null,
        parent_deleted: r.travel_dates?.deleted === true,
        deal_title: deal?.title || null,
        deal_status: deal?.status || null,
        deal_total_value: deal?.total_value ?? null,
        deal_deleted: deal?.deleted === true,
      }
    })
  }

  // --- activecampaign_deals (miroir) -------------------------------------
  if (wants('deals')) {
    const { data, error } = await supabase
      .from('activecampaign_deals')
      .select(`id, title, status, stage, pipeline_id, pipeline_title, seller, total_value, slug, contact, ${AUDIT}`)
      .eq('deleted', true)
      .order('deleted_at', { ascending: false })
      .limit(max)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    result.deals = data || []
  }

  return {
    ...result,
    counts: {
      travel_dates: result.travel_dates.length,
      booked_dates: result.booked_dates.length,
      deals: result.deals.length,
    },
    truncated: {
      travel_dates: result.travel_dates.length >= max,
      booked_dates: result.booked_dates.length >= max,
      deals: result.deals.length >= max,
    },
  }
})
