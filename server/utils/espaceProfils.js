import { randomUUID } from 'node:crypto'
import { createError } from 'h3'

// Profils voyageurs de l'Espace Voyageur : lecture, enregistrement, copie de
// la pièce d'identité, cases « Passeport reçu » / « Régime reçu » d'AC.
//
// Accès (espaceProfil.peutModifier) : la personne si elle a un compte, sinon
// le titulaire du dossier pour elle. Tout autre cas → 404, comme un dossier
// hors du compte : on ne confirme pas qu'une place existe.

const BUCKET = 'traveler-files'
const TAILLE_MAX = 10 * 1024 * 1024
const DUREE_LIEN_S = 60

const introuvable = () => createError({ statusCode: 404, statusMessage: 'Voyageur introuvable.' })

const echec = (error, contexte) => {
  if (!error) return
  console.error(`[espace/profil] ${contexte}`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Enregistrement impossible pour le moment.' })
}

/** La place `slot` du dossier, si ce compte peut en modifier le profil. */
const placeModifiable = async (client, dealId, slot) => {
  const dossier = await espaceDossiers.dossierDuCompte(client, dealId)
  const n = Number.parseInt(slot, 10)
  if (!Number.isInteger(n)) throw introuvable()
  const { data: place, error } = await supabase.from('deal_travelers')
    .select('id, slot, firstname, lastname, user_id, is_holder')
    .eq('deal_id', dossier.deal.id).eq('slot', n).is('removed_at', null).maybeSingle()
  echec(error, 'lecture de la place')
  if (!espaceProfil.peutModifier({ place, clientId: client.id, role: dossier.role })) throw introuvable()
  // « Moi » : la place porte le compte, ou c'est la place du titulaire qui l'édite.
  const estMoi = place.user_id === client.id || (dossier.role === 'titulaire' && place.is_holder)
  return { dossier, place, estMoi }
}

const retourDuDossier = dossier => String(dossier.date?.return_date || dossier.deal.return_date || '').slice(0, 10) || null

const lireProfil = async (placeId) => {
  const { data, error } = await supabase.from('traveler_profiles').select('*').eq('deal_traveler_id', placeId).maybeSingle()
  echec(error, 'lecture du profil')
  return data
}

/** Le dernier profil rempli par cette personne pour un autre voyage, ou null. */
const profilPrecedent = async (userId, placeId) => {
  const { data, error } = await supabase.from('traveler_profiles').select('*')
    .eq('user_id', userId).neq('deal_traveler_id', placeId)
    .order('updated_at', { ascending: false }).limit(1).maybeSingle()
  echec(error, 'profil précédent')
  return data
}

const journal = async (placeId, action, client, scanPath) => {
  const { error } = await supabase.from('traveler_file_access').insert({
    deal_traveler_id: placeId,
    action,
    acteur_user_id: client?.id || null,
    acteur: client?.email || 'purge-automatique',
    scan_path: scanPath || null,
  })
  // Le journal ne bloque pas l'action, mais son absence doit se voir.
  if (error) console.error('[espace/profil] journal non écrit', action, placeId, error.message)
}

/**
 * Enregistre le formulaire (déjà validé par profilVoyageurSchema).
 * Le numéro de pièce n'est touché que s'il est fourni : absent = inchangé.
 */
const enregistrer = async ({ client, place, estMoi, corps }) => {
  const existant = await lireProfil(place.id)
  const ligne = {
    deal_traveler_id: place.id,
    user_id: estMoi ? client.id : (existant?.user_id || null),
    piece_type: corps.pieceType ?? null,
    piece_expiration: corps.pieceExpiration ?? null,
    piece_pays: corps.piecePays ?? null,
    regimes: espaceProfil.normaliserRegimes(corps.regimes),
    allergies: corps.allergies,
    urgence_nom: corps.urgenceNom,
    urgence_lien: corps.urgenceLien,
    urgence_telephone: corps.urgenceTelephone,
    notes: corps.notes,
    updated_by: client.id,
    updated_at: new Date().toISOString(),
  }

  if (corps.pieceNumero === null) {
    ligne.piece_numero_chiffre = null
    ligne.piece_numero_fin = null
  }
  else if (corps.pieceNumero !== undefined) {
    const numero = espaceProfil.normaliserNumero(corps.pieceNumero)
    if (!espaceProfil.numeroValide(numero)) {
      throw createError({ statusCode: 400, statusMessage: 'Numéro de pièce invalide : 5 à 20 lettres ou chiffres.' })
    }
    ligne.piece_numero_chiffre = espaceChiffrement.chiffrer(numero)
    ligne.piece_numero_fin = numero.slice(-4)
  }

  const { data, error } = await supabase.from('traveler_profiles')
    .upsert(ligne, { onConflict: 'deal_traveler_id' }).select('*').single()
  echec(error, 'écriture du profil')
  return data
}

/** Recopie le profil du voyage précédent de la personne (sans la copie de pièce). */
const reprendrePrecedent = async ({ client, place }) => {
  const precedent = await profilPrecedent(client.id, place.id)
  if (!precedent) throw createError({ statusCode: 404, statusMessage: 'Aucun profil précédent à reprendre.' })
  const champs = ['piece_type', 'piece_numero_chiffre', 'piece_numero_fin', 'piece_expiration', 'piece_pays', 'regimes', 'allergies', 'urgence_nom', 'urgence_lien', 'urgence_telephone', 'notes']
  const ligne = Object.fromEntries(champs.map(c => [c, precedent[c]]))
  const { data, error } = await supabase.from('traveler_profiles').upsert({
    ...ligne,
    deal_traveler_id: place.id,
    user_id: client.id,
    updated_by: client.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'deal_traveler_id' }).select('*').single()
  echec(error, 'reprise du profil')
  return data
}

/** Dépose la copie de la pièce ; remplace l'ancienne. */
const deposerScan = async ({ client, place, fichier }) => {
  if (!fichier?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier reçu.' })
  if (fichier.data.length > TAILLE_MAX) throw createError({ statusCode: 413, statusMessage: 'Fichier trop lourd : 10 Mo maximum.' })
  const type = espaceProfil.detecterType(fichier.data)
  if (!type) throw createError({ statusCode: 415, statusMessage: 'Format non accepté : PDF, JPEG, PNG ou photo iPhone (HEIC).' })

  // Chemin sans le nom du fichier envoyé : il peut contenir n'importe quoi.
  const chemin = `${place.id}/${randomUUID()}.${type.ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(chemin, fichier.data, { contentType: type.mime, upsert: false })
  echec(error, 'dépôt de la copie')

  const existant = await lireProfil(place.id)
  const { error: e2 } = await supabase.from('traveler_profiles').upsert({
    deal_traveler_id: place.id,
    user_id: existant?.user_id || null,
    scan_path: chemin,
    scan_type: type.mime,
    scan_taille: fichier.data.length,
    scan_depose_le: new Date().toISOString(),
    updated_by: client.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'deal_traveler_id' })
  if (e2) {
    await supabase.storage.from(BUCKET).remove([chemin])
    echec(e2, 'référence de la copie')
  }
  await journal(place.id, 'depot', client, chemin)
  if (existant?.scan_path) {
    await supabase.storage.from(BUCKET).remove([existant.scan_path])
    await journal(place.id, 'suppression', client, existant.scan_path)
  }
  return { type: type.mime, taille: fichier.data.length }
}

/** Lien de lecture de 60 secondes, après contrôle d'accès ; journalisé. */
const lienScan = async ({ client, place }) => {
  const profil = await lireProfil(place.id)
  if (!profil?.scan_path) throw createError({ statusCode: 404, statusMessage: 'Aucune copie déposée.' })
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(profil.scan_path, DUREE_LIEN_S)
  echec(error, 'lien de la copie')
  await journal(place.id, 'lecture', client, profil.scan_path)
  return { url: data.signedUrl, expireDans: DUREE_LIEN_S }
}

const supprimerScan = async ({ client, place, action = 'suppression' }) => {
  const profil = await lireProfil(place.id)
  if (!profil?.scan_path) return false
  const { error } = await supabase.storage.from(BUCKET).remove([profil.scan_path])
  echec(error, 'suppression de la copie')
  const { error: e2 } = await supabase.from('traveler_profiles')
    .update({ scan_path: null, scan_type: null, scan_taille: null, scan_depose_le: null, updated_at: new Date().toISOString() })
    .eq('deal_traveler_id', place.id)
  echec(e2, 'référence de la copie')
  await journal(place.id, action, client, profil.scan_path)
  return true
}

/** Complétude de chaque place d'un dossier : { [placeId]: completude }. */
const completudesDuDossier = async (dossier) => {
  const { data: places, error } = await supabase.from('deal_travelers')
    .select('id').eq('deal_id', dossier.deal.id).is('removed_at', null)
  echec(error, 'places du dossier')
  const ids = (places || []).map(p => p.id)
  if (!ids.length) return {}
  const { data: profils, error: e2 } = await supabase.from('traveler_profiles').select('*').in('deal_traveler_id', ids)
  echec(e2, 'profils du dossier')
  const parPlace = new Map((profils || []).map(p => [p.deal_traveler_id, p]))
  const retour = retourDuDossier(dossier)
  return Object.fromEntries(ids.map(id => [id, espaceProfil.completude(parPlace.get(id) || null, { retour })]))
}

/**
 * Coche « Passeport reçu » / « Régime alimentaire reçu » dans AC quand TOUS
 * les voyageurs du dossier sont renseignés. Ne décoche jamais : une case
 * cochée à la main par l'équipe reste cochée. Jamais bloquant.
 */
const majCasesAC = async (dossier) => {
  try {
    const completudes = Object.values(await completudesDuDossier(dossier))
    const attendus = Number(dossier.deal.nb_traveler) || completudes.length
    if (!completudes.length || completudes.length < attendus) return
    const { data: miroir } = await supabase.from('activecampaign_deals')
      .select('passport_received, diet_received').eq('id', dossier.deal.id).maybeSingle()
    const champs = {}
    if (completudes.every(c => c.piece) && !miroir?.passport_received) champs.passportReceived = '||Oui||'
    if (completudes.every(c => c.regime) && !miroir?.diet_received) champs.dietReceived = '||Oui||'
    if (Object.keys(champs).length) await activecampaign.updateDeal(dossier.deal.id, champs)
  }
  catch (err) {
    console.error('[espace/profil] cases AC non mises à jour', dossier.deal.id, err?.message)
  }
}

// ── Lecture par l'équipe (Ulysse, jeton de service) ─────────────────────────

const dateIntrouvable = () => createError({ statusCode: 404, statusMessage: 'Date introuvable.' })

const reservationsDeLaDate = async (dateId) => {
  const { data: date, error } = await supabase.from('travel_dates')
    .select('id, return_date, deleted, is_test').eq('id', dateId).maybeSingle()
  echec(error, 'lecture de la date')
  if (!date || date.deleted || date.is_test) throw dateIntrouvable()
  const { data: resas, error: e2 } = await supabase.from('booked_dates')
    .select('id, deal_id, booked_places, is_option')
    .eq('travel_date_id', dateId).eq('deleted', false).not('is_test', 'is', true)
  echec(e2, 'réservations de la date')
  return { date, resas: (resas || []).filter(r => r.deal_id) }
}

/**
 * Voyageurs et profils d'un départ, numéros de pièce DÉCHIFFRÉS : ils servent à
 * émettre les billets. Chaque profil lu est journalisé (« consultation ») au
 * nom de l'utilisateur d'Ulysse. Les dossiers dont les voyageurs n'ont jamais
 * été lus dans AC le sont au passage.
 * @param {string} dateId
 * @param {{ email: string }} acteur utilisateur d'Ulysse (x-ulysse-user)
 */
const profilsDeLaDate = async (dateId, acteur) => {
  const { date, resas } = await reservationsDeLaDate(dateId)
  const dealIds = [...new Set(resas.map(r => Number(r.deal_id)))]
  if (!dealIds.length) return { date: { id: date.id, retour: date.return_date }, reservations: [], synthese: { voyageurs: 0, complets: 0, expirentTropTot: 0, sansProfil: 0 } }

  const { data: deals, error } = await supabase.from('activecampaign_deals')
    .select('id, contact, nb_traveler').in('id', dealIds)
  echec(error, 'dossiers de la date')
  const contacts = [...new Set((deals || []).map(d => d.contact).filter(Boolean))]
  const { data: fiches } = contacts.length
    ? await supabase.from('activecampaign_clients').select('contact, firstname, lastname, email').in('contact', contacts)
    : { data: [] }
  const ficheParContact = new Map((fiches || []).map(f => [Number(f.contact), f]))
  const dealParId = new Map((deals || []).map(d => [Number(d.id), d]))

  const lirePlaces = async () => {
    const { data, error: e } = await supabase.from('deal_travelers')
      .select('id, deal_id, slot, firstname, lastname, birthdate, is_holder, user_id')
      .in('deal_id', dealIds).is('removed_at', null).order('slot')
    echec(e, 'voyageurs de la date')
    return data || []
  }
  let places = await lirePlaces()

  // Dossiers jamais lus par l'espace ni par le webhook depuis sa mise en place.
  const sansPlaces = dealIds.filter(id => !places.some(p => Number(p.deal_id) === id))
  if (sansPlaces.length) {
    for (const id of sansPlaces) {
      try {
        await espaceDossiers.synchroniserVoyageurs(id, { contact: ficheParContact.get(Number(dealParId.get(id)?.contact)) })
      }
      catch (err) {
        console.error('[ulysse/profils] voyageurs non lus', id, err?.message)
      }
    }
    places = await lirePlaces()
  }

  const { data: profils, error: e3 } = places.length
    ? await supabase.from('traveler_profiles').select('*').in('deal_traveler_id', places.map(p => p.id))
    : { data: [], error: null }
  echec(e3, 'profils de la date')
  const profilParPlace = new Map((profils || []).map(p => [p.deal_traveler_id, p]))

  const consultes = []
  const vuePlace = (place) => {
    const p = profilParPlace.get(place.id) || null
    let numero = null
    let numeroIllisible = false
    if (p?.piece_numero_chiffre) {
      try {
        numero = espaceChiffrement.dechiffrer(p.piece_numero_chiffre)
      }
      catch (err) {
        // Mauvaise clé ou valeur altérée : on le dit, sans bloquer la liste.
        numeroIllisible = true
        console.error('[ulysse/profils] numéro illisible', place.id, err?.message)
      }
    }
    if (p) consultes.push(place.id)
    return {
      placeId: place.id,
      slot: place.slot,
      prenom: place.firstname,
      nom: place.lastname,
      dateNaissance: place.birthdate,
      titulaire: place.is_holder,
      compte: Boolean(place.user_id),
      profil: p ? espaceProfil.vueEquipe(p, { numero, numeroIllisible, retour: date.return_date }) : null,
    }
  }

  const reservations = resas.map((r) => {
    const deal = dealParId.get(Number(r.deal_id))
    const fiche = ficheParContact.get(Number(deal?.contact))
    const voyageurs = places.filter(p => Number(p.deal_id) === Number(r.deal_id)).map(vuePlace)
    return {
      bookedId: r.id,
      dealId: Number(r.deal_id),
      option: Boolean(r.is_option),
      places: Number(r.booked_places) || null,
      nbVoyageurs: Number(deal?.nb_traveler) || null,
      contact: fiche ? { prenom: fiche.firstname, nom: fiche.lastname, email: fiche.email } : null,
      voyageurs,
    }
  })

  if (consultes.length) {
    const { error: e4 } = await supabase.from('traveler_file_access').insert(consultes.map(id => ({
      deal_traveler_id: id, action: 'consultation', acteur: acteur.email, acteur_user_id: null,
    })))
    if (e4) console.error('[ulysse/profils] consultations non journalisées', e4.message)
  }

  const tous = reservations.flatMap(r => r.voyageurs)
  return {
    date: { id: date.id, retour: date.return_date },
    reservations,
    synthese: {
      voyageurs: tous.length,
      complets: tous.filter(v => v.profil?.completude.complet && !v.profil.completude.expireTropTot).length,
      expirentTropTot: tous.filter(v => v.profil?.completude.expireTropTot).length,
      sansProfil: tous.filter(v => !v.profil).length,
    },
  }
}

/** Lien de 60 s vers la copie de pièce d'une place de CE départ ; journalisé au nom de l'utilisateur d'Ulysse. */
const lienScanEquipe = async (dateId, placeId, acteur) => {
  const { resas } = await reservationsDeLaDate(dateId)
  const { data: place } = await supabase.from('deal_travelers').select('id, deal_id').eq('id', placeId).maybeSingle()
  // La place doit appartenir à une réservation du départ demandé.
  if (!place || !resas.some(r => Number(r.deal_id) === Number(place.deal_id))) throw introuvable()
  const profil = await lireProfil(place.id)
  if (!profil?.scan_path) throw createError({ statusCode: 404, statusMessage: 'Aucune copie déposée.' })
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(profil.scan_path, DUREE_LIEN_S)
  echec(error, 'lien de la copie')
  await journal(place.id, 'lecture', { id: null, email: acteur.email }, profil.scan_path)
  return { url: data.signedUrl, expireDans: DUREE_LIEN_S }
}

export default {
  BUCKET,
  placeModifiable,
  retourDuDossier,
  lireProfil,
  profilPrecedent,
  enregistrer,
  reprendrePrecedent,
  deposerScan,
  lienScan,
  supprimerScan,
  completudesDuDossier,
  majCasesAC,
  journal,
  profilsDeLaDate,
  lienScanEquipe,
}
