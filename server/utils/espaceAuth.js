import { createError, getHeader } from 'h3'

// Session d'un client de l'Espace Voyageur.
//
// Le navigateur se connecte à Supabase Auth (BackOffice-PROD, la même instance
// qu'Ulysse) et envoie son jeton en `Authorization: Bearer`. Un en-tête et non
// un cookie : rien n'est envoyé tout seul par le navigateur, donc pas de CSRF
// à gérer sur les POST de l'espace.
//
// Être authentifié ne donne accès à RIEN par soi-même : chaque handler filtre
// sur les dossiers rattachés au compte (espaceDossiers.js). Un membre d'Ulysse
// qui ouvre l'espace n'y voit que ses propres voyages.

const lireJeton = (event) => {
  const h = getHeader(event, 'authorization') || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m ? m[1].trim() : null
}

/** Le compte de la requête, ou null. Mémorisé sur la requête. */
const getClientOrNull = async (event) => {
  if (event.context.espaceClient !== undefined) return event.context.espaceClient
  const jeton = lireJeton(event)
  let client = null
  if (jeton) {
    // Vérifié par le serveur d'auth (signature, expiration, compte supprimé ou
    // banni), pas seulement décodé.
    const { data, error } = await supabase.auth.getUser(jeton)
    const user = data?.user
    if (!error && user?.email) {
      client = { id: user.id, email: espaceVoyageur.normaliserEmail(user.email), meta: user.user_metadata || {} }
    }
  }
  event.context.espaceClient = client
  return client
}

const requireClient = async (event) => {
  const client = await getClientOrNull(event)
  if (!client) throw createError({ statusCode: 401, statusMessage: 'Connexion requise.' })
  return client
}

export default { getClientOrNull, requireClient, lireJeton }
