// Pages de l'Espace Voyageur : une session Supabase est requise. Confort
// d'affichage seulement — la vraie garde est côté serveur (espaceAuth.js),
// qui refuse toute requête sans jeton valide.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { init, session } = useEspace()
  await init()
  if (!session.value) {
    return navigateTo({ path: '/mon-espace/connexion', query: { suite: to.fullPath } })
  }
})
