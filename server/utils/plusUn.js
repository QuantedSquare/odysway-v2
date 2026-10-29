import regles from '#shared/plusUn.js'

// « +1 qui fait baisser la marge » : lectures et écritures autour des règles
// pures de shared/plusUn.js.
//
//   - decisionPour       : ce que le tunnel doit faire d'une réservation de N
//                          places (GET /booking/date/:dateId/plus-un) ;
//   - appliquerAuPaiement : avant d'ouvrir un paiement (Stripe, Alma), refuse la
//                          réservation (« par deux ») ou fixe le supplément sur
//                          la réservation et relance la formule du deal ;
//   - supplementDuDeal   : le supplément encore dû, lu par recalculatTotalValues
//                          et par le paiement total Stripe ;
//   - leverSupplements   : après chaque recomptage des places de la date, lève
//                          les suppléments dont le seuil est atteint (déduits du
//                          solde) et alerte si un deal a déjà trop payé.
//
// Le supplément vit sur la réservation (`booked_dates.supplement_plus_un`, en
// centimes), pas dans un champ AC : la valeur du deal dans AC l'inclut, par la
// formule, tant qu'il n'est pas levé.

const COLONNES_DATE = 'id, travel_slug, departure_date, starting_price, max_travelers, margin_override_per_traveler, plus_un_regle, plus_un_supplement'
const COLONNES_SUPPLEMENT = 'supplement_plus_un, supplement_plus_un_seuil, supplement_plus_un_leve_at'

const absent = v => v === null || v === undefined

const lireDate = async (travelDateId) => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select(COLONNES_DATE)
    .eq('id', travelDateId)
    .eq('deleted', false)
    .maybeSingle()
  if (error) throw new Error(`travel_dates illisible : ${error.message}`)
  return data
}

/**
 * Marge par voyageur de la grille pour chaque effectif de 1 à la capacité, par
 * la même résolution que computeMarginForDate (saison, année la plus proche).
 * Une marge forcée sur la date vaut pour tous les effectifs : elle ne baisse
 * jamais avec un voyageur de plus.
 */
const margesParPax = async (travelDate) => {
  const max = Number(travelDate.max_travelers) || 0
  if (max <= 0) return {}
  if (!absent(travelDate.margin_override_per_traveler)) {
    return Object.fromEntries(Array.from({ length: max }, (_, i) => [i + 1, Number(travelDate.margin_override_per_traveler)]))
  }
  const [seasons, settings, { data: rows, error }] = await Promise.all([
    margins.getSeasonsForVoyage(travelDate.travel_slug),
    margins.getSettingsForVoyage(travelDate.travel_slug),
    supabase
      .from('voyage_margins')
      .select('pax, margin_per_traveler, year, season_id, purchase_cost_per_traveler, sale_price_per_traveler')
      .eq('voyage_slug', travelDate.travel_slug)
      .eq('deleted', false),
  ])
  if (error) throw new Error(`voyage_margins illisible : ${error.message}`)
  if (settings?.config_mode && settings.config_mode !== 'pax_table') return {}

  const marges = {}
  for (let pax = 1; pax <= max; pax++) {
    const { value } = margins.resolveBaseFromRows({
      rows: (rows || []).filter(r => Number(r.pax) === pax),
      seasons,
      departureDate: travelDate.departure_date,
      datePrice: travelDate.starting_price,
      settings,
    })
    if (!absent(value)) marges[pax] = value
  }
  return marges
}

/** Places payées de la date : les options ne comptent pas (computeMarginForDate). */
const placesPayees = async (travelDateId) => {
  const { data, error } = await supabase
    .from('booked_dates')
    .select('booked_places, is_option')
    .eq('travel_date_id', travelDateId)
    .eq('deleted', false)
  if (error) throw new Error(`booked_dates illisible : ${error.message}`)
  return (data || []).filter(r => r.is_option !== true).reduce((n, r) => n + (Number(r.booked_places) || 0), 0)
}

const lireReservation = async (bookedId) => {
  const { data, error } = await supabase
    .from('booked_dates')
    .select(`id, deal_id, travel_date_id, booked_places, is_option, transaction_id, ${COLONNES_SUPPLEMENT}`)
    .eq('id', bookedId)
    .eq('deleted', false)
    .maybeSingle()
  if (error) throw new Error(`booked_dates illisible : ${error.message}`)
  return data
}

const dejaReglee = row => !!row?.transaction_id || (Number(row?.booked_places) > 0 && row?.is_option !== true)

/**
 * Décision pour une réservation de `ajout` places. Une réservation qui porte
 * déjà son supplément le garde (reprise, relance du paiement) ; une réservation
 * déjà réglée n'est pas un nouveau voyageur.
 */
const decisionPour = async ({ travelDateId, ajout, bookedId = null }) => {
  const row = bookedId ? await lireReservation(bookedId) : null
  if (row && !absent(row.supplement_plus_un)) {
    const supplement = regles.supplementActif(row)
    return supplement > 0
      ? { action: 'supplement', supplement, seuil: row.supplement_plus_un_seuil, enregistre: true }
      : { action: 'libre', leve: !!row.supplement_plus_un_leve_at }
  }
  if (dejaReglee(row)) return { action: 'libre' }

  const date = await lireDate(travelDateId)
  const regle = date?.plus_un_regle || regles.REGLE_DEFAUT
  if (!date || regle === 'libre') return { action: 'libre' }

  const [margesGrille, payes] = await Promise.all([margesParPax(date), placesPayees(travelDateId)])
  return regles.decider({
    regle,
    supplementDate: date.plus_un_supplement,
    margesParPax: margesGrille,
    payes,
    ajout,
    max: date.max_travelers,
  })
}

const euros = centimes => `${(centimes / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`

/**
 * Avant d'ouvrir un acompte ou un paiement total. Lève une 409 si la date se
 * vend « par deux » ; pose le supplément et relance la formule du deal sinon.
 * Une date « libre » ne coûte qu'une lecture.
 */
const appliquerAuPaiementSansGarde = async ({ bookedId, dealId }) => {
  const row = await lireReservation(bookedId)
  if (!row || !absent(row.supplement_plus_un) || dejaReglee(row)) return { action: 'libre' }
  const date = await lireDate(row.travel_date_id)
  if (!date || (date.plus_un_regle || 'libre') === 'libre') return { action: 'libre' }

  const champs = await activecampaign.getDealCustomFields(dealId)
  const ajout = Number(champs?.nbTravelers) || 0
  const decision = await decisionPour({ travelDateId: row.travel_date_id, ajout })

  if (decision.action === 'refus') {
    // Cas métier attendu, pas une panne : le tunnel l'affiche tel quel.
    throw createError({
      statusCode: 409,
      statusMessage: regles.messageTunnel(decision),
      data: { code: 'PLUS_UN_PAR_DEUX', minimum: decision.minimum, userMessage: regles.messageTunnel(decision) },
    })
  }
  if (decision.action !== 'supplement') return decision

  const { error } = await supabase
    .from('booked_dates')
    .update({ supplement_plus_un: decision.supplement, supplement_plus_un_seuil: decision.seuil })
    .eq('id', bookedId)
    .is('supplement_plus_un', null)
  if (error) throw new Error(`supplément non enregistré : ${error.message}`)

  await activecampaign.recalculatTotalValues(dealId)
  const seuil = absent(decision.seuil)
    ? 'aucun effectif de la capacité ne rétablit la marge : il ne sera pas levé'
    : `levé (déduit du solde) quand le départ comptera ${decision.seuil} voyageurs payés`
  await activecampaign.addNote(dealId, {
    note: { note: `Supplément « +1 » de ${euros(decision.supplement)} : ${ajout} voyageur(s) de plus font baisser la marge du groupe sur ce départ. Ajouté à la valeur du deal, ${seuil}.` },
  }).catch(err => console.error(`[plusUn] note AC non ajoutée au deal ${dealId}:`, err?.message))
  return decision
}

// Seul le refus « par deux » interrompt le paiement : une lecture en panne ne
// doit pas empêcher un client de payer. Elle est tracée, et le Docteur d'Ulysse
// voit la valeur du deal si le supplément manque.
const appliquerAuPaiement = async (args) => {
  try {
    return await appliquerAuPaiementSansGarde(args)
  }
  catch (err) {
    if (err?.data?.code === 'PLUS_UN_PAR_DEUX') throw err
    console.error(`[plusUn] règle « +1 » non appliquée au deal ${args?.dealId}:`, err?.message)
    return { action: 'libre', indisponible: true }
  }
}

/**
 * Supplément encore dû par le deal, en centimes. `null` si la réservation est
 * illisible : la formule ne doit alors rien réécrire, sans quoi elle effacerait
 * un supplément de la valeur du deal.
 */
const supplementDuDeal = async (dealId) => {
  const { data, error } = await supabase
    .from('booked_dates')
    .select(COLONNES_SUPPLEMENT)
    .eq('deal_id', dealId)
    .eq('deleted', false)
    .maybeSingle()
  // Colonne absente (migration pas encore jouée) : aucun supplément n'existe.
  if (error?.code === '42703') return 0
  if (error) {
    console.error(`[plusUn] supplément du deal ${dealId} illisible:`, error.message)
    return null
  }
  return regles.supplementActif(data)
}

/**
 * Après un recomptage : chaque supplément dont le seuil est atteint est levé
 * une fois pour toutes (il ne revient pas si un voyageur annule ensuite), le
 * deal est recalculé — le supplément sort du solde — et l'équipe est prévenue
 * s'il faut rembourser un deal déjà réglé au-delà.
 */
const leverSupplements = async (travelDateId) => {
  const { data: rows, error } = await supabase
    .from('booked_dates')
    .select(`id, deal_id, ${COLONNES_SUPPLEMENT}`)
    .eq('travel_date_id', travelDateId)
    .eq('deleted', false)
    .gt('supplement_plus_un', 0)
    .is('supplement_plus_un_leve_at', null)
  if (error) throw new Error(`booked_dates illisible : ${error.message}`)
  if (!rows?.length) return []

  const payes = await placesPayees(travelDateId)
  const leves = []
  for (const row of rows.filter(r => regles.aLever(r, payes))) {
    const { data: maj, error: majError } = await supabase
      .from('booked_dates')
      .update({ supplement_plus_un_leve_at: new Date().toISOString() })
      .eq('id', row.id)
      .is('supplement_plus_un_leve_at', null)
      .select('id')
    if (majError || !maj?.length) continue
    leves.push(row.id)
    if (!row.deal_id) continue

    await activecampaign.recalculatTotalValues(row.deal_id)
    const champs = await activecampaign.getDealCustomFields(row.deal_id).catch(() => null)
    const { deal } = await activecampaign.getDealById(row.deal_id).catch(() => ({ deal: null }))
    const tropPercu = champs && deal ? (Number(champs.alreadyPaid) || 0) - (Number(deal.value) || 0) : 0
    const montant = euros(Number(row.supplement_plus_un))
    await activecampaign.addNote(row.deal_id, {
      note: { note: `Supplément « +1 » de ${montant} levé : le départ compte ${payes} voyageurs payés, la marge du groupe est rétablie. Il est déduit du solde.${tropPercu > 0 ? ` Déjà réglé au-delà : ${euros(tropPercu)} à rembourser.` : ''}` },
    }).catch(err => console.error(`[plusUn] note AC non ajoutée au deal ${row.deal_id}:`, err?.message))
    if (tropPercu > 0) {
      await slack.send(process.env.SLACK_URL_PAIEMENTS,
        `:moneybag: *Supplément « +1 » levé sur un deal déjà réglé — à rembourser*\n`
        + `• Deal : <https://odysway90522.activehosted.com/app/deals/${row.deal_id}|${row.deal_id}>  ·  supplément : ${montant}\n`
        + `• Trop-perçu : ${euros(tropPercu)}`)
    }
  }
  return leves
}

export default {
  margesParPax,
  placesPayees,
  decisionPour,
  appliquerAuPaiement,
  supplementDuDeal,
  leverSupplements,
}
