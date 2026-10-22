import { defineEventHandler, setResponseHeaders } from 'h3'

// Soumet la page à Odysway : brouillon Sanity `drafts.voyage-portage-…` (portage,
// sur-mesure seul, page non publiée) et alerte Slack. Odysway relit et publie
// dans le Studio.
//
//   POST /api/v1/espace-porteur/pages/:pageId/soumettre
//   422 avec `data.manques` s'il manque un élément obligatoire.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  return espacePorteur.vuePage(await espacePorteur.soumettre(porteur, event.context.params.pageId))
})
