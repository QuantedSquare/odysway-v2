import { createError, defineEventHandler, getHeader } from 'h3'

// Purge des copies de pièces d'identité de l'Espace Voyageur, 30 jours après
// le retour du voyage (espaceProfil.CONSERVATION_SCAN_JOURS). À appeler une
// fois par jour, comme le cronjob des options, avec l'en-tête x-cron-secret.
//
//   POST /api/v1/webhooks/espace/purge-pieces
//
// Le numéro de pièce, lui, reste (chiffré) : il sert à pré-remplir le voyage
// suivant. Chaque suppression est journalisée (action « purge »).

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getHeader(event, 'x-cron-secret') !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data: profils, error } = await supabase.from('traveler_profiles')
    .select('deal_traveler_id, scan_path').not('scan_path', 'is', null)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!profils?.length) return { examines: 0, purges: 0 }

  const { data: places } = await supabase.from('deal_travelers').select('id, deal_id').in('id', profils.map(p => p.deal_traveler_id))
  const dealIds = [...new Set((places || []).map(p => Number(p.deal_id)))]
  const [{ data: deals }, { data: resas }] = await Promise.all([
    supabase.from('activecampaign_deals').select('id, return_date').in('id', dealIds),
    supabase.from('booked_dates').select('deal_id, travel_date_id').in('deal_id', dealIds).eq('deleted', false),
  ])
  const dateIds = [...new Set((resas || []).map(r => r.travel_date_id).filter(Boolean))]
  const { data: dates } = dateIds.length
    ? await supabase.from('travel_dates').select('id, return_date').in('id', dateIds)
    : { data: [] }

  const retourDate = new Map((dates || []).map(d => [d.id, d.return_date]))
  const retourParDeal = new Map((deals || []).map(d => [Number(d.id), d.return_date]))
  for (const r of resas || []) {
    if (retourDate.get(r.travel_date_id)) retourParDeal.set(Number(r.deal_id), retourDate.get(r.travel_date_id))
  }
  const dealParPlace = new Map((places || []).map(p => [p.id, Number(p.deal_id)]))

  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  let purges = 0
  for (const p of profils) {
    const retour = retourParDeal.get(dealParPlace.get(p.deal_traveler_id))
    if (!espaceProfil.scanAPurger({ retour, aujourdhui })) continue
    try {
      await espaceProfils.supprimerScan({ client: null, place: { id: p.deal_traveler_id }, action: 'purge' })
      purges++
    }
    catch (err) {
      console.error('[espace/purge-pieces]', p.deal_traveler_id, err?.message)
    }
  }
  console.log(`[espace/purge-pieces] ${purges} copie(s) purgée(s) sur ${profils.length}`)
  return { examines: profils.length, purges }
})
