import { createError } from 'h3'

// Le titulaire d'un dossier corrige ses voyageurs depuis l'Espace Voyageur :
//   - identité d'une place (prénom, nom, date de naissance) → champ AC
//     « Voyageur N », note AC, deal_travelers, Slack ;
//   - « C'est moi » : il désigne sa propre place quand son nom n'y correspond
//     pas (nom d'usage, faute de frappe) → deal_travelers.holder_manuel.
// Règles pures : espaceCorrection.js et espaceVoyageur.js.

const introuvable = () => createError({ statusCode: 404, statusMessage: 'Voyageur introuvable.' })

const echec = (error, contexte) => {
  if (!error) return
  console.error(`[espace/correction] ${contexte}`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Enregistrement impossible pour le moment.' })
}

const numeroDePlace = (slot) => {
  const n = Number.parseInt(slot, 10)
  if (!Number.isInteger(n) || n < 1 || n > 15) throw introuvable()
  return n
}

const placesDuDeal = async (dealId) => {
  const { data, error } = await supabase.from('deal_travelers')
    .select('id, slot, firstname, lastname, is_holder, holder_manuel, user_id, email')
    .eq('deal_id', dealId).is('removed_at', null).order('slot')
  echec(error, 'places du dossier')
  return data || []
}

const ficheContact = async (contact) => {
  const { data } = await supabase.from('activecampaign_clients').select('firstname, lastname').eq('contact', contact).maybeSingle()
  return data || null
}

/** Pose le choix sur `slot`, et le retire des autres places (une seule par deal, index unique). */
const poserChoix = async (dealId, slot) => {
  const maintenant = new Date().toISOString()
  const { error } = await supabase.from('deal_travelers')
    .update({ holder_manuel: false, is_holder: false, updated_at: maintenant })
    .eq('deal_id', dealId).neq('slot', slot)
  echec(error, 'autres places')
  const { error: e2 } = await supabase.from('deal_travelers')
    .update({ holder_manuel: true, is_holder: true, updated_at: maintenant })
    .eq('deal_id', dealId).eq('slot', slot)
  echec(e2, 'place choisie')
}

/**
 * « C'est moi » sur la place `slot`, ou `null` pour revenir à la
 * reconnaissance par le nom du contact.
 * @returns {Promise<{ slot: number|null }>} la place du titulaire après coup
 */
const designerTitulaire = async ({ client, dossier, slot }) => {
  if (dossier.role !== 'titulaire') throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  const dealId = Number(dossier.deal.id)
  const places = await placesDuDeal(dealId)

  if (slot === null) {
    const maintenant = new Date().toISOString()
    const parNom = espaceVoyageur.slotTitulaire(places, await ficheContact(dossier.deal.contact))
    const { error } = await supabase.from('deal_travelers')
      .update({ holder_manuel: false, is_holder: false, updated_at: maintenant })
      .eq('deal_id', dealId)
    echec(error, 'retrait du choix')
    if (parNom) {
      const { error: e2 } = await supabase.from('deal_travelers')
        .update({ is_holder: true, updated_at: maintenant })
        .eq('deal_id', dealId).eq('slot', parNom)
      echec(e2, 'place par le nom')
    }
    return { slot: parNom }
  }

  const n = numeroDePlace(slot)
  const place = places.find(p => p.slot === n)
  if (!place) throw introuvable()
  if (!espaceVoyageur.peutSeDesigner({ place, clientId: client.id, clientEmail: client.email })) {
    throw createError({ statusCode: 409, statusMessage: 'Cette place est celle d\'un voyageur invité : annulez d\'abord son invitation.' })
  }
  await poserChoix(dealId, n)
  return { slot: n }
}

/**
 * Corrige l'identité de la place `slot`.
 * @param {{ client: object, dossier: object, slot: unknown, avant: object, saisie: object }} p
 *   avant : l'identité que la page affichait ; saisie : la nouvelle (date 'YYYY-MM-DD')
 */
const corrigerIdentite = async ({ client, dossier, slot, avant, saisie }) => {
  if (dossier.role !== 'titulaire') throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  const dealId = Number(dossier.deal.id)
  const n = numeroDePlace(slot)
  const place = (await placesDuDeal(dealId)).find(p => p.slot === n)
  if (!place) throw introuvable()

  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const depart = dossier.date?.departure_date || dossier.deal.departure_date || null
  const verrouille = (billetsAchetes) => {
    const verrou = espaceCorrection.verrouCorrection({ billetsAchetes, depart, aujourdhui })
    if (verrou) throw createError({ statusCode: 409, statusMessage: espaceCorrection.MESSAGES_VERROU[verrou], data: { code: 'verrouille', verrou } })
  }
  verrouille(dossier.deal.flight_ticket_bought)

  const { identite, erreurs } = espaceCorrection.validerIdentite(saisie, { aujourdhui })
  if (!identite) throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide.', data: { erreurs } })

  let lu
  try {
    lu = await dealMirrorSync.lireDeal(dealId)
  }
  catch (err) {
    console.error('[espace/correction] lecture AC', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: 'Enregistrement impossible pour le moment. Réessayez dans un instant.' })
  }
  // AC fait foi : la case du miroir a pu ne pas encore suivre.
  verrouille(lu.fusion.flightTicketBought)

  const cle = `traveler${n}`
  const rawActuel = lu.fusion[cle] ? String(lu.fusion[cle]).trim() : null
  const actuel = espaceCorrection.identiteDe(rawActuel)
  const contact = await ficheContact(dossier.deal.contact)

  // Quelqu'un (l'équipe, le webhook) a changé ce voyageur depuis l'affichage.
  if (!rawActuel || !espaceCorrection.memeIdentite(actuel, avant)) {
    try {
      await espaceDossiers.synchroniserVoyageurs(dealId, { fusion: lu.fusion, contact })
    }
    catch (err) {
      console.error('[espace/correction] resynchro après écart', dealId, err?.message)
    }
    throw createError({ statusCode: 409, statusMessage: 'Ce voyageur a été modifié entre-temps : rechargez la page pour voir la version à jour.', data: { code: 'modifie' } })
  }
  if (espaceCorrection.memeIdentite(actuel, identite)) return { resultat: 'inchange', voyageur: { slot: n, ...actuel } }
  if (espaceCorrection.ageEnJeu({ avant: actuel, apres: identite, depart, aujourdhui })) {
    throw createError({ statusCode: 409, statusMessage: 'La date de naissance d\'un voyageur mineur peut changer le tarif : contactez-nous pour la corriger.', data: { code: 'age' } })
  }

  const rawNouveau = espaceCorrection.champAc(rawActuel, identite)
  try {
    await activecampaign.updateDeal(dealId, { [cle]: rawNouveau })
  }
  catch (err) {
    console.error('[espace/correction] écriture AC refusée', dealId, n, err?.message)
    throw createError({ statusCode: 502, statusMessage: 'Enregistrement impossible pour le moment. Réessayez dans un instant.' })
  }

  // AC est écrit : la suite ne transforme plus la correction en erreur.
  let note = true
  try {
    await activecampaign.addNote(dealId, { note: { note: espaceCorrection.noteCorrection({ slot: n, avant: rawActuel, apres: rawNouveau, auteur: client.email }) } })
  }
  catch (err) {
    note = false
    console.error('[espace/correction] note AC non écrite', dealId, err?.message)
  }

  // Sa propre place reste la sienne même si le nouveau nom ne correspond
  // plus à celui du contact AC.
  try {
    if (place.is_holder && !place.holder_manuel) await poserChoix(dealId, n)
    await espaceDossiers.synchroniserVoyageurs(dealId, { fusion: { ...lu.fusion, [cle]: rawNouveau }, contact })
  }
  catch (err) {
    // Le webhook dealUpdate d'AC relira les voyageurs.
    console.error('[espace/correction] voyageurs non resynchronisés', dealId, err?.message)
  }

  await slack.alertCorrectionVoyageur({
    dealId,
    slot: n,
    avant: rawActuel,
    apres: rawNouveau,
    auteur: client.email,
    personneChangee: espaceCorrection.personneChangee(actuel, identite),
    // Chapka est prévenu au premier paiement, qui fait passer le deal en pipeline 2.
    assurance: espaceCorrection.assuranceSouscrite(lu.fusion.insurance) && Number(lu.deal?.group) === 2,
  })

  return { resultat: 'corrige', voyageur: { slot: n, ...identite }, note }
}

export default {
  designerTitulaire,
  corrigerIdentite,
}
