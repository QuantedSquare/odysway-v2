import { createError, defineEventHandler, getHeader, readBody } from 'h3'

// Rattache à leur deal les paiements Alma enregistrés avant que le webhook ne
// le fasse (migrations 20260925120000_alma_ids_deal.sql, 20260925160000_alma_ids_rattachement.sql).
//
//   POST /api/v1/ulysse/alma/rattacher
//   en-tête  x-ulysse-service-token (ou x-cron-secret)
//   corps    { limit?: 20 }
// Rappeler tant que `restants` > 0. LECTURE SEULE chez Alma ; n'écrit que
// `alma_ids.deal_id` et `alma_ids.rattachement`. Idempotent.
//
// Pour chaque paiement, dans l'ordre :
//   1. `booked_dates.transaction_id` : le webhook y a écrit l'identifiant du
//      paiement sur la réservation du deal (un seul deal, sinon on passe) ;
//   2. `custom_data` du paiement chez Alma (`id`, `dealId`, `deal_id`).
// Un paiement introuvable chez Alma en production (test du bac à sable) ou sans
// deal est marqué, pour ne plus revenir en tête des appels suivants.

const LIMITE_MAX = 40

export default defineEventHandler(async (event) => {
  const cron = process.env.CRON_SECRET && getHeader(event, 'x-cron-secret') === process.env.CRON_SECRET
  if (!cron) requireUlysseService(event)

  const body = (await readBody(event).catch(() => null)) || {}
  const limit = Math.min(LIMITE_MAX, Math.max(1, Number.parseInt(body.limit, 10) || 20))

  const { data, error } = await supabase.from('alma_ids').select('id')
    .is('deal_id', null).is('rattachement', null).order('created_at').limit(limit)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  const ids = (data || []).map(r => r.id)

  // Réservations qui portent ces paiements : le lien le plus sûr, écrit par le webhook lui-même.
  const { data: resas, error: erreurResas } = ids.length
    ? await supabase.from('booked_dates').select('transaction_id, deal_id').in('transaction_id', ids)
    : { data: [], error: null }
  if (erreurResas) throw createError({ statusCode: 500, statusMessage: erreurResas.message })
  const dealsParPaiement = new Map()
  for (const r of resas || []) {
    const deals = dealsParPaiement.get(r.transaction_id) || new Set()
    deals.add(Number(r.deal_id))
    dealsParPaiement.set(r.transaction_id, deals)
  }

  const marquer = (id, patch) => supabase.from('alma_ids').update(patch).eq('id', id).is('deal_id', null)
  const resultat = { rattaches: 0, parReservation: 0, introuvables: [], sansDeal: [], erreurs: [] }
  for (const id of ids) {
    try {
      const parResa = dealsParPaiement.get(id)
      let dealId = parResa?.size === 1 ? [...parResa][0] : null
      if (dealId) resultat.parReservation += 1
      if (!dealId) {
        let paiement
        try {
          paiement = await alma.lirePaiement(id)
        }
        catch (err) {
          if (err?.response?.status !== 404) throw err
          const { error: e } = await marquer(id, { rattachement: 'introuvable' })
          if (e) throw new Error(e.message)
          resultat.introuvables.push(id)
          continue
        }
        dealId = paiementsDeal.dealDuPaiementAlma(paiement)
      }
      if (!dealId) {
        const { error: e } = await marquer(id, { rattachement: 'sans_deal' })
        if (e) throw new Error(e.message)
        resultat.sansDeal.push(id)
        continue
      }
      const { error: maj } = await marquer(id, { deal_id: dealId, rattachement: null })
      if (maj) throw new Error(maj.message)
      resultat.rattaches += 1
    }
    catch (err) {
      resultat.erreurs.push({ id, message: err?.response?.data?.message || err?.message || String(err) })
    }
  }

  const { count } = await supabase.from('alma_ids').select('id', { count: 'exact', head: true }).is('deal_id', null).is('rattachement', null)
  return { ...resultat, restants: count ?? null }
})
