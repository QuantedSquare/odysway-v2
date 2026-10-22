import { createClient } from '@sanity/client'
import { createError } from 'h3'
import portageDates from '#shared/portageDates.js'
import portagePage from '#shared/portagePage.js'

// Dates d'un séjour en portage dans l'Espace porteur (/espace-porteur/dates/:id).
//
// Le porteur propose des dates (`portage_propositions_dates`) ; Odysway les
// accepte ou les refuse dans Ulysse, qui crée la date (`travel_dates`) par le
// pont puis appelle `decider`. Le porteur voit ensuite le remplissage de chaque
// départ de son séjour : des comptes, jamais l'identité des inscrits.

const COLONNES = 'id, page_id, porteur_id, depart, retour, participants_min, participants_max, prix_souhaite, note, statut, reponse, travel_date_id, traite_le, created_at'
const EN_ATTENTE_MAX = 10
const PASSES_MONTRES = 3
const UUID = /^[0-9a-f-]{36}$/

// Le jour à Paris : un départ « demain » ne doit pas basculer à minuit UTC.
const aujourdhui = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())

const jourFr = j => new Date(`${j}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

const vueProposition = r => ({
  id: r.id,
  depart: r.depart,
  retour: r.retour,
  participantsMin: r.participants_min,
  participantsMax: r.participants_max,
  prixSouhaite: r.prix_souhaite === null ? null : r.prix_souhaite / 100,
  note: r.note,
  statut: r.statut,
  reponse: r.reponse,
  travelDateId: r.travel_date_id,
  traiteLe: r.traite_le,
  creeLe: r.created_at,
})

const echec = (statusCode, statusMessage) => createError({ statusCode, statusMessage })

// Fermeture des inscriptions (jours avant le départ), réglée dans Sanity.
const closingDaysDe = async (slug) => {
  try {
    const config = useRuntimeConfig()
    const client = createClient({
      projectId: config.public.sanity.projectId,
      dataset: config.public.sanity.dataset,
      apiVersion: config.public.sanity.apiVersion,
      useCdn: true,
      perspective: 'published',
    })
    const n = await client.fetch('*[_type == "voyage" && slug.current == $slug][0].closingDays', { slug })
    return Number.isFinite(Number(n)) && n !== null ? Number(n) : 30
  }
  catch {
    return 30
  }
}

const departsDuSejour = async (slug) => {
  const { data: dates, error } = await supabase.from('travel_dates')
    .select('id, departure_date, return_date, min_travelers, max_travelers, booked_seat, published, is_test')
    .eq('travel_slug', slug).eq('deleted', false)
    .order('departure_date', { ascending: true })
  if (error) throw echec(500, 'Lecture des départs impossible pour le moment.')
  const actives = (dates || []).filter(d => d.is_test !== true)
  if (!actives.length) return { aVenir: [], passes: [] }

  const { data: reservations, error: errResa } = await supabase.from('booked_dates')
    .select('travel_date_id, deal_id, booked_places, is_option, is_test')
    .in('travel_date_id', actives.map(d => d.id)).eq('deleted', false)
  if (errResa) throw echec(500, 'Lecture des inscriptions impossible pour le moment.')
  const resas = (reservations || []).filter(r => r.is_test !== true)

  const idsDeals = [...new Set(resas.map(r => r.deal_id).filter(Boolean))]
  const deals = new Map()
  if (idsDeals.length) {
    const { data, error: errDeals } = await supabase.from('activecampaign_deals')
      .select('id, pipeline_id, stage_id, total_paid, status').in('id', idsDeals)
    if (errDeals) throw echec(500, 'Lecture des inscriptions impossible pour le moment.')
    for (const d of data || []) deals.set(Number(d.id), d)
  }

  const jour = aujourdhui()
  const closingDays = await closingDaysDe(slug)
  const vues = actives.map(date => portageDates.remplissage({
    date,
    reservations: resas.filter(r => r.travel_date_id === date.id).map(r => ({ ...r, deal: deals.get(Number(r.deal_id)) || null })),
    aujourdhui: jour,
    closingDays,
  }))
  return {
    aVenir: vues.filter(v => v.statut !== 'passee'),
    passes: vues.filter(v => v.statut === 'passee').reverse().slice(0, PASSES_MONTRES),
  }
}

/** Ce que voit le porteur : ses propositions, les départs du séjour et leur remplissage. */
const datesDeLaPage = async (porteur, pageId) => {
  const page = await espacePorteur.pageDuPorteur(porteur, pageId)
  const { data, error } = await supabase.from('portage_propositions_dates').select(COLONNES)
    .eq('page_id', page.id).order('depart', { ascending: true })
  if (error) throw echec(500, 'Lecture des dates impossible pour le moment.')
  const departs = page.slug && page.publie_le ? await departsDuSejour(page.slug) : { aVenir: [], passes: [] }
  return {
    titre: portagePage.nettoyer(page.payload).titre || null,
    enLigne: Boolean(page.publie_le),
    propositions: (data || []).map(vueProposition),
    ...departs,
  }
}

const proposer = async (porteur, pageId, corps) => {
  const page = await espacePorteur.pageDuPorteur(porteur, pageId)
  const { valeur, erreurs } = portageDates.nettoyerProposition(corps, { aujourdhui: aujourdhui() })
  if (erreurs.length) {
    throw createError({ statusCode: 422, statusMessage: `Indiquez ${erreurs.join(', ')}.`, data: { erreurs } })
  }

  const { count, error: errCompte } = await supabase.from('portage_propositions_dates')
    .select('id', { count: 'exact', head: true }).eq('page_id', page.id).eq('statut', 'proposee')
  if (errCompte) throw echec(500, 'Enregistrement impossible pour le moment.')
  if (count >= EN_ATTENTE_MAX) throw echec(429, `Déjà ${EN_ATTENTE_MAX} dates en attente de réponse : patientez avant d'en proposer d'autres.`)

  const { data, error } = await supabase.from('portage_propositions_dates')
    .insert({ ...valeur, page_id: page.id, porteur_id: porteur.porteur_id })
    .select(COLONNES).single()
  if (error) throw echec(500, 'Enregistrement impossible pour le moment.')

  await slack.alertPortageDate({
    porteur: porteur.nom,
    titre: portagePage.nettoyer(page.payload).titre || 'Séjour sans titre',
    depart: jourFr(valeur.depart),
    retour: jourFr(valeur.retour),
    participants: valeur.participants_min || valeur.participants_max
      ? `${valeur.participants_min ?? '?'} à ${valeur.participants_max ?? '?'} participants`
      : '',
    prix: valeur.prix_souhaite ? `${valeur.prix_souhaite / 100} €` : '',
    note: valeur.note,
  })
  return vueProposition(data)
}

/** Le porteur retire une proposition encore sans réponse. */
const retirer = async (porteur, pageId, propositionId) => {
  const page = await espacePorteur.pageDuPorteur(porteur, pageId)
  if (!UUID.test(String(propositionId || ''))) throw echec(404, 'Proposition introuvable.')
  const { data, error } = await supabase.from('portage_propositions_dates')
    .update({ statut: 'retiree', updated_at: new Date().toISOString() })
    .eq('id', propositionId).eq('page_id', page.id).eq('statut', 'proposee')
    .select(COLONNES).maybeSingle()
  if (error) throw echec(500, 'Modification impossible pour le moment.')
  if (!data) throw echec(409, 'Cette proposition a déjà reçu une réponse.')
  return vueProposition(data)
}

// --- Décision d'Odysway (Ulysse, par le pont) --------------------------------

const emailDecision = ({ nom, titre, depart, retour, acceptee, reponse }) => {
  const e = espacePorteur.echapper
  const lien = `${useRuntimeConfig().public.siteURL}/espace-porteur`
  const quoi = `du ${jourFr(depart)} au ${jourFr(retour)}`
  return {
    subject: acceptee ? `Votre date ${quoi} est retenue` : 'Votre proposition de date',
    html: `<!doctype html><html lang="fr"><body style="margin:0;background:#F1F4F4;font-family:Arial,sans-serif;color:#2B4C52">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;padding:32px">
<tr><td style="font-size:22px;font-weight:700;padding-bottom:20px">odysway<span style="color:#DB6644">.</span></td></tr>
<tr><td style="font-size:15px;line-height:1.6">
<p>Bonjour${nom ? ` ${e(nom)}` : ''},</p>
<p>${acceptee
  ? `Bonne nouvelle : la date ${e(quoi)} de « ${e(titre)} » est retenue. L'équipe Odysway la prépare (prix, places) puis l'ouvre aux inscriptions sur votre page.`
  : `La date ${e(quoi)} proposée pour « ${e(titre)} » n'a pas été retenue telle quelle.`}</p>
${reponse ? `<p style="background:#FBF0EC;border-radius:12px;padding:12px 16px">${e(reponse).replace(/\n/g, '<br>')}</p>` : ''}
<p>Vous suivez vos dates et leurs inscriptions dans votre Espace porteur.</p>
<p style="margin:28px 0"><a href="${e(lien)}" style="background:#DB6644;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">Ouvrir mon Espace porteur</a></p>
</td></tr></table>
<p style="font-size:12px;color:#8A9BA0;margin-top:16px">Odysway · +33 1 84 80 79 75</p>
</td></tr></table></body></html>`,
  }
}

/**
 * Odysway accepte (la date est créée : `travelDateId`) ou refuse une
 * proposition. 409 si elle a déjà reçu une réponse ou été retirée. Le porteur
 * est prévenu par email ; un email qui ne part pas ne défait pas la décision.
 */
const decider = async ({ propositionId, decision, reponse, travelDateId, par }) => {
  if (!UUID.test(String(propositionId || ''))) throw echec(404, 'Proposition introuvable.')
  if (!['acceptee', 'refusee'].includes(decision)) throw echec(400, 'Décision attendue : acceptee ou refusee.')
  if (decision === 'acceptee' && !UUID.test(String(travelDateId || ''))) throw echec(400, 'Une proposition acceptée est rattachée à la date créée (travelDateId).')
  const texte = typeof reponse === 'string' ? reponse.trim().slice(0, 1000) : ''

  const { data, error } = await supabase.from('portage_propositions_dates')
    .update({
      statut: decision,
      reponse: texte || null,
      travel_date_id: decision === 'acceptee' ? travelDateId : null,
      traite_par: par || null,
      traite_le: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', propositionId).eq('statut', 'proposee')
    .select(COLONNES).maybeSingle()
  if (error) throw echec(500, `Décision non enregistrée : ${error.message}`)
  if (!data) throw echec(409, 'Cette proposition a déjà reçu une réponse, ou le porteur l\'a retirée.')

  let emailEnvoye = false
  try {
    const [{ data: porteur }, { data: page }] = await Promise.all([
      supabase.from('portage_porteurs').select('nom, email, revoque_le').eq('porteur_id', data.porteur_id).maybeSingle(),
      supabase.from('portage_pages').select('payload').eq('id', data.page_id).maybeSingle(),
    ])
    if (porteur?.email && !porteur.revoque_le) {
      await espacePorteur.envoyerEmail({
        to: porteur.email,
        ...emailDecision({
          nom: porteur.nom,
          titre: portagePage.nettoyer(page?.payload).titre || 'votre séjour',
          depart: data.depart,
          retour: data.retour,
          acceptee: decision === 'acceptee',
          reponse: texte,
        }),
      })
      emailEnvoye = true
    }
  }
  catch (err) {
    console.error('[dates-porteur] email de décision non envoyé', propositionId, err?.response?.data || err?.message)
  }
  return { ...vueProposition(data), emailEnvoye }
}

export default { datesDeLaPage, proposer, retirer, decider }
