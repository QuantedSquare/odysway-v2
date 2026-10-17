import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Le titulaire invite un voyageur de son dossier par email.
//
//   POST /api/v1/espace/dossiers/:dealId/voyageurs/:slot/invitation
//   { email: "lea@exemple.fr" }  — ou { email: null } pour annuler
//
// L'invité se connecte ensuite avec CETTE adresse : la connexion prouve qu'il
// la possède, et le rattachement (espaceDossiers.rattacherParEmail) pose son
// compte sur la place. Le lien de l'email ne porte ni jeton ni adresse.

const DELAI_RENVOI_MS = 2 * 60 * 1000

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const dossier = await espaceDossiers.dossierDuCompte(client, event.context.params.dealId)
  if (dossier.role !== 'titulaire') throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })

  const slot = Number.parseInt(event.context.params.slot, 10)
  const body = await readBody(event).catch(() => ({}))
  const annuler = body?.email === null
  const email = annuler ? null : espaceVoyageur.normaliserEmail(body?.email)
  if (!annuler && !espaceVoyageur.emailValide(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })
  }

  const dealId = Number(dossier.deal.id)
  const { data: places, error } = await supabase.from('deal_travelers')
    .select('id, slot, firstname, email, user_id, is_holder, invited_at')
    .eq('deal_id', dealId).is('removed_at', null)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Lecture impossible pour le moment.' })

  const place = (places || []).find(p => p.slot === slot)
  if (!place) throw createError({ statusCode: 404, statusMessage: 'Voyageur introuvable.' })
  if (place.user_id) throw createError({ statusCode: 409, statusMessage: 'Ce voyageur a déjà rejoint l\'espace.' })
  if (place.is_holder) throw createError({ statusCode: 409, statusMessage: 'Cette place est la vôtre.' })

  if (annuler) {
    await supabase.from('deal_travelers').update({ email: null, invited_at: null, invited_by: null, updated_at: new Date().toISOString() }).eq('id', place.id)
    return { slot, invitation: null, email: null }
  }

  if (email === client.email) throw createError({ statusCode: 400, statusMessage: 'C\'est votre propre adresse.' })
  if ((places || []).some(p => p.slot !== slot && p.email === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Cette adresse est déjà invitée sur une autre place.' })
  }
  if (place.email === email && place.invited_at && Date.now() - Date.parse(place.invited_at) < DELAI_RENVOI_MS) {
    throw createError({ statusCode: 429, statusMessage: 'Invitation déjà envoyée, patientez un instant avant de la renvoyer.' })
  }

  const { error: e2 } = await supabase.from('deal_travelers')
    .update({ email, invited_at: new Date().toISOString(), invited_by: client.id, updated_at: new Date().toISOString() })
    .eq('id', place.id)
  if (e2) throw createError({ statusCode: 500, statusMessage: 'Invitation impossible pour le moment.' })

  const { data: fiche } = await supabase.from('activecampaign_clients').select('firstname, lastname').eq('contact', dossier.deal.contact).maybeSingle()
  const config = useRuntimeConfig()
  const contenu = espaceEmails.invitationVoyageur({
    prenomInvite: place.firstname,
    prenomTitulaire: fiche?.firstname || null,
    voyage: espaceVoyageur.titreVoyage(dossier.deal.title, fiche),
    lien: `${config.public.siteURL}/mon-espace/connexion`,
  })
  try {
    await brevo.envoyerEmail({ to: email, ...contenu })
  }
  catch (err) {
    console.error('[espace/invitation] email non envoyé', dealId, slot, err?.message)
    throw createError({ statusCode: 502, statusMessage: 'L\'email d\'invitation n\'a pas pu partir. Réessayez dans un instant.' })
  }
  return { slot, invitation: 'envoyee', email }
})
