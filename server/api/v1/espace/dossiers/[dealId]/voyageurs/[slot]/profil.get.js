import { defineEventHandler, setResponseHeaders } from 'h3'

// Profil d'un voyageur du dossier, pour la personne ou pour le titulaire qui
// le remplit à sa place.
//
//   GET /api/v1/espace/dossiers/:dealId/voyageurs/:slot/profil
//
// Le numéro de pièce n'est JAMAIS renvoyé, seulement ses 4 derniers caractères.
// `precedent` signale un profil d'un autre voyage de la même personne, que le
// navigateur peut proposer de reprendre (POST …/profil { reprendre: true }).

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const { dossier, place, estMoi } = await espaceProfils.placeModifiable(client, event.context.params.dealId, event.context.params.slot)
  const retour = espaceProfils.retourDuDossier(dossier)
  const profil = await espaceProfils.lireProfil(place.id)
  const precedent = !profil && estMoi ? await espaceProfils.profilPrecedent(client.id, place.id) : null

  return {
    voyageur: { slot: place.slot, prenom: place.firstname, nom: place.lastname, moi: estMoi },
    dossier: { id: Number(dossier.deal.id), retour },
    regimesDisponibles: espaceProfil.REGIMES,
    validiteMois: espaceProfil.VALIDITE_MOIS_APRES_RETOUR,
    conservationScanJours: espaceProfil.CONSERVATION_SCAN_JOURS,
    profil: espaceProfil.vueProfil(profil, { retour }),
    precedent: precedent
      ? { misAJourLe: precedent.updated_at, pieceNumeroFin: precedent.piece_numero_fin, pieceType: precedent.piece_type }
      : null,
  }
})
