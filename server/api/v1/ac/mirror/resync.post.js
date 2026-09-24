import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import dayjs from 'dayjs'

// Resynchronise le miroir `activecampaign_deals` depuis l'API AC.
//
// Pourquoi : le webhook dealUpdate n'écrit une ligne que quand un deal change.
// Après une évolution du mapping (server/utils/dealMirror.js), les deals qui ne
// bougent pas gardent leur ancienne ligne. Quant aux dossiers de départ
// (pipeline 4), longtemps ignorés par le webhook, ils sont presque tous absents.
//
// LECTURE SEULE côté AC : ni recalculatTotalValues, ni mise à jour de contact,
// ni réservation. Seule la ligne miroir est réécrite. Idempotent : rejouer une
// page réécrit les mêmes lignes.
//
// Appel, page par page pour tenir dans la durée d'une fonction et sous la
// limite de 5 requêtes par seconde d'AC :
//   POST /api/v1/ac/mirror/resync
//   header  x-cron-secret: <CRON_SECRET>
//   body    { scope: 'vivants' | 'ids', ids?: number[], offset?: 0, limit?: 20, dryRun?: false }
// Rappeler avec `offset = nextOffset` jusqu'à ce qu'il vaille null.
//
// « vivants » : prospects ouverts, voyageurs non perdus rentrés depuis moins de
// 90 jours (ou sans date), annulations ouvertes, et les dossiers de départ des
// dates non supprimées rentrées depuis moins de 90 jours.

const PAUSE_MS = 250 // ~4 requêtes/s, sous la limite de 5/s d'AC
const LIMITE_MAX = 40
const RETOUR_JOURS = 90
const TEST_EMAILS = new Set(['ottmann.alex@gmail.com', 'test@gmail.com']) // mêmes exclusions que le webhook

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

const toutesLesPages = async (construire) => {
  const lignes = []
  for (let debut = 0; ; debut += 1000) {
    const { data, error } = await construire().range(debut, debut + 999)
    if (error) throw error
    lignes.push(...(data || []))
    if (!data || data.length < 1000) return lignes
  }
}

const idsVivants = async () => {
  const depuis = dayjs().subtract(RETOUR_JOURS, 'day').format('YYYY-MM-DD')
  const [prospects, voyageurs, annulations, dates] = await Promise.all([
    toutesLesPages(() => supabase.from('activecampaign_deals').select('id')
      .eq('pipeline_id', 1).eq('status', 'Ouvert').eq('deleted', false).order('id')),
    toutesLesPages(() => supabase.from('activecampaign_deals').select('id')
      .eq('pipeline_id', 2).neq('status', 'Perdu').eq('deleted', false)
      .or(`return_date.is.null,return_date.gte.${depuis}`).order('id')),
    toutesLesPages(() => supabase.from('activecampaign_deals').select('id')
      .eq('pipeline_id', 5).eq('status', 'Ouvert').eq('deleted', false).order('id')),
    toutesLesPages(() => supabase.from('travel_dates').select('departure_id')
      .not('departure_id', 'is', null).eq('deleted', false)
      .or(`return_date.is.null,return_date.gte.${depuis}`).order('id')),
  ])
  const ids = [
    ...prospects.map(r => Number(r.id)),
    ...voyageurs.map(r => Number(r.id)),
    ...annulations.map(r => Number(r.id)),
    ...dates.map(r => Number(r.departure_id)),
  ].filter(id => Number.isInteger(id) && id > 0)
  return [...new Set(ids)].sort((a, b) => a - b)
}

// Libellés que le webhook reçoit dans sa charge mais que l'API REST ne donne
// qu'en identifiants : étapes, pipelines, propriétaires.
const lireLibelles = async () => {
  const [etapes, pipelines, utilisateurs] = await Promise.all([
    activecampaign.listStages(),
    activecampaign.listPipelines(),
    activecampaign.listUsers(),
  ])
  const parId = (lignes, libelle) => Object.fromEntries((lignes || []).map(l => [String(l.id), libelle(l)]))
  return {
    stages: parId(etapes?.dealStages, l => l.title),
    pipelines: parId(pipelines?.dealGroups, l => l.title),
    owners: parId(utilisateurs?.users, l => `${l.firstName || ''} ${l.lastName || ''}`.trim() || null),
  }
}

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getHeader(event, 'x-cron-secret') !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = (await readBody(event).catch(() => null)) || {}
  const scope = body.scope === 'ids' ? 'ids' : 'vivants'
  const offset = Math.max(0, Number.parseInt(body.offset, 10) || 0)
  const limit = Math.min(LIMITE_MAX, Math.max(1, Number.parseInt(body.limit, 10) || 20))
  const dryRun = body.dryRun === true

  let tous
  if (scope === 'ids') {
    if (!Array.isArray(body.ids) || !body.ids.length) {
      throw createError({ statusCode: 400, statusMessage: 'scope "ids" : fournir un tableau `ids`' })
    }
    tous = [...new Set(body.ids.map(Number).filter(id => Number.isInteger(id) && id > 0))].sort((a, b) => a - b)
  }
  else {
    tous = await idsVivants()
  }
  const page = tous.slice(offset, offset + limit)

  const lookups = await lireLibelles()
  const resultat = { scope, dryRun, total: tous.length, offset, limit, upserted: 0, ignores: [], erreurs: [], apercu: [] }

  for (const dealId of page) {
    try {
      const { deal } = await activecampaign.getDealById(dealId)
      await pause(PAUSE_MS)
      const champs = await activecampaign.getDealCustomFields(dealId)
      await pause(PAUSE_MS)

      // Corbeille AC : c'est le webhook qui applique la suppression, pas nous.
      if (deal.group === '3') {
        resultat.ignores.push({ id: dealId, raison: 'corbeille AC' })
        continue
      }

      const contactId = Number(deal.contact)
      const { data: client } = await supabase
        .from('activecampaign_clients').select('email').eq('contact', contactId).maybeSingle()
      if (client && TEST_EMAILS.has(client.email)) {
        resultat.ignores.push({ id: dealId, raison: 'contact de test' })
        continue
      }

      const ligne = dealMirror.mapDealToMirrorRow({ dealId, contactId, fetchedDeal: { ...deal, ...champs }, lookups })
      if (resultat.apercu.length < 3) resultat.apercu.push(ligne)
      if (dryRun) continue

      const { error } = await supabase.from('activecampaign_deals').upsert(ligne, { onConflict: 'id' })
      if (error) throw new Error(error.message)
      resultat.upserted += 1
    }
    catch (err) {
      const statut = err?.response?.status
      resultat.erreurs.push({ id: dealId, message: statut === 404 ? 'introuvable dans AC' : (err?.message || String(err)) })
    }
  }

  resultat.nextOffset = offset + limit < tous.length ? offset + limit : null
  console.log('[mirror-resync]', { ...resultat, apercu: undefined })
  return resultat
})
