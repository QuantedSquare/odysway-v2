// Ligne du miroir `activecampaign_deals` construite à partir d'un deal AC.
//
// Une seule fonction pour tous les écrivains du miroir — le webhook dealUpdate
// et la resynchronisation (`/api/v1/ac/mirror/resync`) — afin qu'ils ne
// divergent plus. Pure : aucun appel réseau, aucun import automatique de Nitro,
// testée par tests/unit/dealMirror.test.mjs (`npm run test:unit`).
//
// Règle : un champ absent d'AC donne `null`, jamais 0 ni une valeur inventée.
// Le Docteur d'Ulysse doit distinguer « non renseigné » de « zéro » : une marge
// à 0 € saisie n'est pas une marge oubliée. Seules les deux anciennes colonnes
// d'assurance gardent leur comportement historique (voir plus bas).

const STATUTS = { 0: 'Ouvert', 1: 'Gagné', 2: 'Perdu', 3: 'Supprimé' }

const mapDealStatus = status => STATUTS[status] ?? 'Inconnu'

const vide = v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

// AC transmet les montants des champs « currency » en centimes, sous forme de texte.
const centimesEnEuros = (v) => {
  if (vide(v)) return null
  const n = Number(v)
  return Number.isFinite(n) ? n / 100 : null
}

const nombre = (v) => {
  if (vide(v)) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const texte = v => (vide(v) ? null : String(v))

// Case à cocher ou bouton radio AC : 'Oui', ['Oui'] ou '||Oui||' selon le type
// du champ et le chemin de lecture.
const oui = (v) => {
  const brut = Array.isArray(v) ? v[0] : v
  if (vide(brut) || typeof brut === 'object') return null
  const s = String(brut).replace(/\|/g, '').trim().toLowerCase()
  if (!s) return null
  return s === 'oui' || s === 'true' || s === '1' || s === 'yes'
}

// Champs « Voyageur 1 » à « Voyageur 15 » (ids 33-40 et 97-103). Le tunnel les
// remplit au format "prénom_nom_JJ/MM/AAAA_ISO" (TravelersInfosOptions.vue).
const CHAMPS_VOYAGEURS = Array.from({ length: 15 }, (_, i) => `traveler${i + 1}`)
// Pas de \b : « _ » compte comme un caractère de mot, « nom_12/03/1961 » n'aurait
// aucune frontière avant la date.
const DATE_NAISSANCE = /(?<!\d)\d{2}\/\d{2}\/\d{4}(?!\d)/

const compterVoyageurs = (deal) => {
  const remplis = CHAMPS_VOYAGEURS.map(k => deal[k]).filter(v => !vide(v)).map(String)
  return {
    nommes: remplis.length,
    avecNaissance: remplis.filter(v => DATE_NAISSANCE.test(v)).length,
  }
}

/**
 * @param {object} p
 * @param {string|number} p.dealId
 * @param {string|number} p.contactId
 * @param {object} p.fetchedDeal  deal AC (`/deals/:id`) fusionné avec ses champs personnalisés mappés
 * @param {object} [p.body]       charge du webhook AC (champs `deal[...]`), absente en resynchronisation
 * @param {string|null} [p.eventTime]
 * @param {object} [p.lookups]    libellés lus dans AC quand le webhook ne les fournit pas :
 *                                { stages: {id: titre}, pipelines: {id: titre}, owners: {id: "Prénom Nom"} }
 */
const mapDealToMirrorRow = ({ dealId, contactId, fetchedDeal, body = {}, eventTime = null, lookups = {} }) => {
  const d = fetchedDeal || {}
  const stageId = body['deal[stageid]'] || d.stage || null
  const pipelineId = +(body['deal[pipelineid]'] || d.group) || null
  const ownerId = body['deal[owner]'] || d.owner || null

  const nomProprietaire = `${body['deal[owner_firstname]'] || ''} ${body['deal[owner_lastname]'] || ''}`.trim()
  const seller = nomProprietaire || lookups.owners?.[ownerId] || ownerId || null

  // La charge du webhook donne la valeur en euros (`value_raw`) ; l'API REST la
  // donne en centimes. L'ancien repli lisait les centimes comme des euros.
  const valueRaw = body['deal[value_raw]']
  const totalValue = !vide(valueRaw) ? nombre(valueRaw) : centimesEnEuros(d.value)

  const mdate = d.mdate || eventTime || null
  const voyageurs = compterVoyageurs(d)

  return {
    id: dealId,
    contact: contactId,
    title: body['deal[title]'] || d.title || null,
    status: mapDealStatus(body['deal[status]'] ?? d.status),
    stage: body['deal[stage_title]'] || lookups.stages?.[stageId] || null,
    stage_id: stageId,
    pipeline_id: pipelineId,
    pipeline_title: body['deal[pipeline_title]'] || lookups.pipelines?.[pipelineId] || null,
    owner_id: ownerId,
    seller,
    currency: body['deal[currency]'] || d.currency || null,
    win_probability: nombre(d.winProbability),
    next_date: d.nextdate || null,
    next_task_id: d.nexttaskid || null,
    total_value: totalValue,
    price_per_traveler: centimesEnEuros(d.basePricePerTraveler),
    nb_traveler: nombre(d.nbTravelers),
    nb_adults: nombre(d.nbAdults),
    nb_children: nombre(d.nbChildren),
    nb_under_age: nombre(d.nbUnderAge),
    nb_teen: nombre(d.nbTeen),
    travel_type: texte(d.travelType),
    indiv_room: oui(d.indivRoom),
    forced_indiv_room: oui(d.forcedIndivRoom),
    indiv_room_price: centimesEnEuros(d.indivRoomPrice),
    deposit_price: centimesEnEuros(d.depositPrice),
    extension_price: centimesEnEuros(d.extensionPrice),
    agent_cost: centimesEnEuros(d.agentCost),
    rest_to_pay: centimesEnEuros(d.restToPay),
    total_paid: centimesEnEuros(d.alreadyPaid),
    margin_per_traveler: centimesEnEuros(d.marginPerTraveler),
    extra_margin_per_traveler: centimesEnEuros(d.extraMarginPerTraveler),
    flight_margin: centimesEnEuros(d.flightMargin),
    total_margin: centimesEnEuros(d.totalMargin),
    // Assurance. Les clés du mapping AC sont trompeuses : `insuranceCommissionPrice`
    // (champ 13) est le PRIX par voyageur, `insuranceCommissionPerTraveler`
    // (champ 47) la COMMISSION par voyageur (30 %).
    insurance_price_per_pax: centimesEnEuros(d.insuranceCommissionPrice),
    insurance_commission_per_pax: centimesEnEuros(d.insuranceCommissionPerTraveler),
    // Anciennes colonnes, OBSOLÈTES et inversées par rapport à leur nom : elles
    // gardent exactement leur contenu historique (0 par défaut) pour ne rien
    // changer aux tableaux de bord analytiques qui les lisent encore.
    insurance_commission: centimesEnEuros(d.insuranceCommissionPrice) ?? 0,
    insurance_price_per_traveler: centimesEnEuros(d.insuranceCommissionPerTraveler) ?? 0,
    insurance_choice: texte(d.insurance),
    is_cap_exploraction: oui(d.isCapExploraction),
    promo_code: texte(d.promoCode),
    applied_promo_per_traveler: centimesEnEuros(d.promoValue),
    children_promo: centimesEnEuros(d.promoChildren),
    teen_promo: centimesEnEuros(d.promoTeen),
    promo_earlybird: centimesEnEuros(d.promoEarlybird),
    got_earlybird: oui(d.gotEarlybird),
    promo_last_minute: centimesEnEuros(d.promoLastMinute),
    got_last_minute: oui(d.gotLastMinute),
    country: texte(d.country),
    iso: texte(d.iso),
    zone_chapka: nombre(d.zoneChapka),
    is_couple: oui(d.isCouple),
    lost_reason: d.ReasonLost || d.otherReasonLost || null,
    rest_to_pay_per_traveler: centimesEnEuros(d.restToPayPerTraveler),
    max_children_age: nombre(d.maxChildrenAge),
    max_teen_age: nombre(d.maxTeenAge),
    include_flight: oui(d.includeFlight),
    flight_ticket_bought: oui(d.flightTicketBought),
    flight_ticket_price_per_traveler: centimesEnEuros(d.flightPrice),
    departure_date: d.departureDate || null,
    return_date: d.returnDate || null,
    forecasted_closing_date: d.forecastedClosingDate || null,
    conversion_date: d.conversionDate || null,
    source: texte(d.source),
    acquisition_source: texte(d.acquisitionSource),
    other_acquisition_source: texte(d.otherAcquisitionSource),
    utm: texte(d.utm),
    slug: texte(d.slug),
    current_step: texte(d.currentStep),
    link_bms: texte(d.linkBms),
    paiement_method: texte(d.paiementMethod),
    // Préparation du voyage et annulation (Docteur, familles PRE et ANN).
    named_travelers: voyageurs.nommes,
    travelers_with_birthdate: voyageurs.avecNaissance,
    passport_received: oui(d.passportReceived),
    flight_plan_received: oui(d.flightPlanReceived),
    diet_received: oui(d.dietReceived),
    travel_book: texte(d.travelBook),
    cancellation_fee: centimesEnEuros(d.cancellationFee),
    // `created_at` absent (undefined) : l'upsert laisse la valeur en place.
    created_at: d.oldCreationDate || body['deal[create_date_iso]'] || d.cdate || undefined,
    mdate,
    updated_at: mdate || new Date().toISOString(),
  }
}

export default {
  mapDealToMirrorRow,
  mapDealStatus,
  centimesEnEuros,
  nombre,
  oui,
  compterVoyageurs,
}
