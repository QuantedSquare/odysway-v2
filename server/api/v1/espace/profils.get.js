import { defineEventHandler, setResponseHeaders } from 'h3'

// « Mon profil » : toutes les places que ce compte peut remplir, sur ses
// voyages à venir ou en cours — la sienne et celles des voyageurs sans compte
// de ses dossiers (enfants, proches non invités).
//
//   GET /api/v1/espace/profils

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const dossiers = (await espaceDossiers.dossiersDuCompte(client)).filter((d) => {
    const etat = espaceVoyageur.resumeDossier(d, aujourdhui).etat
    return etat === 'a_venir' || etat === 'en_cours' || etat === 'sans_date'
  })

  const lignes = []
  for (const dossier of dossiers) {
    const [voyageurs, completudes] = await Promise.all([
      espaceDossiers.voyageursDuDossier(dossier.deal.id),
      espaceProfils.completudesDuDossier(dossier),
    ])
    const resume = espaceVoyageur.resumeDossier(dossier, aujourdhui)
    for (const v of voyageurs) {
      if (!espaceProfil.peutModifier({ place: v, clientId: client.id, role: dossier.role })) continue
      const c = completudes[v.id] || espaceProfil.completude(null)
      lignes.push({
        dossier: { id: resume.id, slug: resume.slug, titre: resume.titre, depart: resume.depart },
        slot: v.slot,
        prenom: v.firstname,
        nom: v.lastname,
        moi: v.user_id === client.id || (dossier.role === 'titulaire' && v.is_holder),
        completude: { complet: c.complet, manques: c.manques, expireTropTot: c.expireTropTot },
      })
    }
  }
  // Sa propre place d'abord, puis par date de départ.
  lignes.sort((a, b) => Number(b.moi) - Number(a.moi) || String(a.dossier.depart).localeCompare(String(b.dossier.depart)))
  return { profils: lignes }
})
