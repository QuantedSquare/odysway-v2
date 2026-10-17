import { defineEventHandler, setResponseHeaders } from 'h3'

// « Mes documents » : documents de voyage publiés, par dossier du compte.
//
//   GET /api/v1/espace/documents

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const dossiers = await espaceDossiers.dossiersDuCompte(client)
  const parDossier = await espaceDocuments.documentsDesDossiers(client, dossiers)
  return {
    dossiers: dossiers
      .map(d => ({ ...espaceVoyageur.resumeDossier(d, aujourdhui), documents: parDossier.get(Number(d.deal.id)) || [] }))
      .map(({ id, slug, titre, depart, retour, etat, role, documents }) => ({ id, slug, titre, depart, retour, etat, role, documents }))
      .sort((a, b) => (a.etat === 'passe') - (b.etat === 'passe') || String(a.depart || '').localeCompare(String(b.depart || ''))),
  }
})
