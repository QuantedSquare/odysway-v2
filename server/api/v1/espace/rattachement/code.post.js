import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Envoie un code à une SECONDE adresse pour y rattacher ses dossiers.
//
//   POST /api/v1/espace/rattachement/code   { email }
//
// Répond pareil que l'adresse soit cliente ou non : rien ne doit permettre de
// tester quelles adresses ont réservé chez Odysway. Supabase Auth n'est pas
// utilisé ici : il ouvrirait une session sur l'autre adresse.

const MAX_PAR_HEURE = 5
const DELAI_RENVOI_MS = 60 * 1000

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const body = await readBody(event).catch(() => ({}))
  const email = espaceVoyageur.normaliserEmail(body?.email)
  if (!espaceVoyageur.emailValide(email)) throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })
  if (email === client.email) throw createError({ statusCode: 400, statusMessage: 'Cette adresse est déjà celle de votre compte.' })

  const depuis = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: recents, error } = await supabase.from('client_link_codes')
    .select('email, created_at').eq('user_id', client.id).gte('created_at', depuis).order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Envoi impossible pour le moment.' })
  if ((recents || []).length >= MAX_PAR_HEURE) {
    throw createError({ statusCode: 429, statusMessage: 'Trop de codes demandés. Réessayez dans une heure.' })
  }
  const dernier = (recents || []).find(r => r.email === email)
  if (dernier && Date.now() - Date.parse(dernier.created_at) < DELAI_RENVOI_MS) {
    throw createError({ statusCode: 429, statusMessage: 'Un code vient d\'être envoyé. Patientez une minute.' })
  }

  const code = espaceCodes.nouveauCode()
  const { error: e2 } = await supabase.from('client_link_codes').insert({
    user_id: client.id,
    email,
    code_hash: espaceCodes.hacher({ userId: client.id, email, code }),
    expires_at: new Date(Date.now() + espaceCodes.DUREE_MS).toISOString(),
  })
  if (e2) throw createError({ statusCode: 500, statusMessage: 'Envoi impossible pour le moment.' })

  try {
    await brevo.envoyerEmail({ to: email, ...espaceEmails.codeRattachement({ code }) })
  }
  catch (err) {
    console.error('[espace/rattachement] code non envoyé', err?.message)
    throw createError({ statusCode: 502, statusMessage: 'L\'email n\'a pas pu partir. Réessayez dans un instant.' })
  }
  return { envoye: true }
})
