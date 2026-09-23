// Le back-office /booking-management a été retiré : Ulysse le remplace. Des
// liens y pointent encore — champ « Lien BMS » des deals ActiveCampaign, alertes
// Slack déjà postées, favoris — on les renvoie vers Ulysse plutôt que vers une
// 404. Sans NUXT_ULYSSE_URL, la page n'existe simplement plus.
export default defineEventHandler((event) => {
  const { ulysseUrl } = useRuntimeConfig(event)
  if (!ulysseUrl) {
    throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
  }
  return sendRedirect(event, ulysseUrl, 302)
})
