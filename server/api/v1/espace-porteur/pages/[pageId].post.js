import { defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Sauvegarde automatique du brouillon. POST et non PUT : la politique CORS de
// production n'ouvre que GET/HEAD/POST.
//
//   POST /api/v1/espace-porteur/pages/:pageId  { payload, revision }
//   409 si une autre fenêtre a enregistré depuis `revision`.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  const body = await readBody(event).catch(() => ({}))
  const page = await espacePorteur.enregistrer(porteur, event.context.params.pageId, { payload: body?.payload, revision: body?.revision })
  return espacePorteur.vuePage(page)
})
