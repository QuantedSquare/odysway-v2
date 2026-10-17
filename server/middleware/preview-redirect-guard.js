// /preview/disable (route de @nuxtjs/sanity, active hors production) redirige
// vers `?redirect=` sans le vérifier : sur une preview publique, c'est une
// redirection ouverte (lien d'hameçonnage sous notre domaine). On n'y accepte
// qu'un chemin relatif au site.
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/preview/disable')) return

  const { redirect } = getQuery(event)
  if (redirect === undefined) return

  const target = String(redirect)
  const isSitePath = target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
  if (!isSitePath) {
    throw createError({ statusCode: 400, statusMessage: 'Redirection non autorisée' })
  }
})
