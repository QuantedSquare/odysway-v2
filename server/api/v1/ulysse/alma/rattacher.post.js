import { createError, defineEventHandler, getHeader, readBody } from 'h3'

// Rattache à leur deal les paiements Alma enregistrés avant que le webhook ne
// le fasse (migration 20260925120000_alma_ids_deal.sql).
//
//   POST /api/v1/ulysse/alma/rattacher
//   en-tête  x-ulysse-service-token (ou x-cron-secret)
//   corps    { limit?: 20 }
// Rappeler tant que `restants` > 0. LECTURE SEULE chez Alma ; n'écrit que
// `alma_ids.deal_id`. Idempotent.

const LIMITE_MAX = 40

export default defineEventHandler(async (event) => {
  const cron = process.env.CRON_SECRET && getHeader(event, 'x-cron-secret') === process.env.CRON_SECRET
  if (!cron) requireUlysseService(event)

  const body = (await readBody(event).catch(() => null)) || {}
  const limit = Math.min(LIMITE_MAX, Math.max(1, Number.parseInt(body.limit, 10) || 20))

  const { data, error } = await supabase.from('alma_ids').select('id').is('deal_id', null).order('created_at').limit(limit)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const resultat = { rattaches: 0, sansDeal: [], erreurs: [] }
  for (const { id } of data || []) {
    try {
      const paiement = await alma.lirePaiement(id)
      const dealId = Number.parseInt(paiement?.custom_data?.id, 10)
      if (!Number.isInteger(dealId) || dealId <= 0) {
        resultat.sansDeal.push(id)
        continue
      }
      const { error: maj } = await supabase.from('alma_ids').update({ deal_id: dealId }).eq('id', id).is('deal_id', null)
      if (maj) throw new Error(maj.message)
      resultat.rattaches += 1
    }
    catch (err) {
      resultat.erreurs.push({ id, message: err?.response?.data?.message || err?.message || String(err) })
    }
  }

  const { count } = await supabase.from('alma_ids').select('id', { count: 'exact', head: true }).is('deal_id', null)
  // Un paiement sans deal chez Alma reste « à rattacher » : `restants` le compte,
  // `sansDeal` dit lesquels, pour ne pas boucler dessus.
  return { ...resultat, restants: count ?? null }
})
