import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Enregistre le profil d'un voyageur.
//
//   POST /api/v1/espace/dossiers/:dealId/voyageurs/:slot/profil
//   corps : profilVoyageurSchema  — ou { reprendre: true } pour recopier le
//   profil du voyage précédent de la personne (hors copie de pièce).

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const { dossier, place, estMoi } = await espaceProfils.placeModifiable(client, event.context.params.dealId, event.context.params.slot)
  const body = await readBody(event).catch(() => null)

  let profil
  if (body?.reprendre === true) {
    if (!estMoi) throw createError({ statusCode: 400, statusMessage: 'Seule la personne peut reprendre son propre profil.' })
    profil = await espaceProfils.reprendrePrecedent({ client, place })
  }
  else {
    const parsed = profilVoyageurSchema.safeParse(body || {})
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide.', data: { champs: parsed.error.issues.map(i => i.path.join('.')) } })
    }
    profil = await espaceProfils.enregistrer({ client, place, estMoi, corps: parsed.data })
  }

  await espaceProfils.majCasesAC(dossier)
  return { profil: espaceProfil.vueProfil(profil, { retour: espaceProfils.retourDuDossier(dossier) }) }
})
