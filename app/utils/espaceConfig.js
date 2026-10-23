// Configuration publique de l'Espace Voyageur (runtimeConfig.public.espace).
// Sans URL ni clé publiable, supabase-js refuse de créer le client
// (« supabaseKey is required. ») : l'espace est alors indisponible, jamais cassé.
// Lu par useEspace et par l'avertissement de build de nuxt.config.ts.

/** Code d'erreur porté par l'exception levée quand l'espace ne peut pas démarrer. */
export const ESPACE_INDISPONIBLE = 'espace_indisponible'

/** Noms des réglages manquants, `[]` si la configuration est complète. */
export const reglagesEspaceManquants = espace => ['supabaseUrl', 'supabaseKey']
  .filter(cle => !String(espace?.[cle] || '').trim())

// Retour de la connexion Google (et du lien des emails de code). Supabase Auth
// n'accepte que les URLs de sa liste « Redirect URLs » (BackOffice-PROD ›
// Authentication › URL Configuration) ; toute autre l'envoie, sans erreur, sur
// son Site URL : Ulysse, le back-office, avec le code du client.
// Ne lister ici QUE des origines déclarées là-bas : une origine absente d'ici
// désactive Google (sans danger), une origine absente de Supabase renvoie sur
// Ulysse.
export const CHEMIN_RETOUR = '/mon-espace/connexion'

const ORIGINES_RETOUR = [
  'https://odysway.com',
  'https://dev.odysway.com',
  'http://localhost:3000',
  // Previews Vercel (nom d'hôte haché ou alias de branche)
  /^https:\/\/odysway-v2-[a-z0-9-]+-odysway\.vercel\.app$/,
]

/** URL de retour pour cette origine, ou null si Supabase la refuserait. */
export const urlRetourEspace = (origine) => {
  const o = String(origine || '')
  const connue = ORIGINES_RETOUR.some(r => typeof r === 'string' ? r === o : r.test(o))
  return connue ? `${o}${CHEMIN_RETOUR}` : null
}

/** Code d'erreur : la connexion Google renverrait le client hors de l'espace. */
export const RETOUR_NON_AUTORISE = 'retour_non_autorise'
