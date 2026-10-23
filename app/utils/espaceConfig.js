// Configuration publique de l'Espace Voyageur (runtimeConfig.public.espace).
// Sans URL ni clé publiable, supabase-js refuse de créer le client
// (« supabaseKey is required. ») : l'espace est alors indisponible, jamais cassé.
// Lu par useEspace et par l'avertissement de build de nuxt.config.ts.

/** Code d'erreur porté par l'exception levée quand l'espace ne peut pas démarrer. */
export const ESPACE_INDISPONIBLE = 'espace_indisponible'

/** Noms des réglages manquants, `[]` si la configuration est complète. */
export const reglagesEspaceManquants = espace => ['supabaseUrl', 'supabaseKey']
  .filter(cle => !String(espace?.[cle] || '').trim())
