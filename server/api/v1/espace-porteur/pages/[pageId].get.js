import { defineEventHandler, setResponseHeaders } from 'h3'

//   GET /api/v1/espace-porteur/pages/:pageId

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  return espacePorteur.vuePage(await espacePorteur.pageDuPorteur(porteur, event.context.params.pageId))
})
