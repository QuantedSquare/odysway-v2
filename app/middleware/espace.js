// Pages de l'Espace Voyageur : une session Supabase est requise. Confort
// d'affichage seulement — la vraie garde est côté serveur (espaceAuth.js),
// qui refuse toute requête sans jeton valide.
//
// Ne lève jamais : une exception ici annulerait la navigation sans rien
// afficher (le lien « Mon espace » paraîtrait mort). Espace indisponible ou
// pas de session : direction la page de connexion, qui explique.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { init, session, indisponible } = useEspace()
  try {
    await init()
  }
  catch (err) {
    console.error('[espace] middleware :', err)
    indisponible.value = true
  }
  if (indisponible.value || !session.value) {
    return navigateTo({ path: '/mon-espace/connexion', query: { suite: to.fullPath } })
  }
})
