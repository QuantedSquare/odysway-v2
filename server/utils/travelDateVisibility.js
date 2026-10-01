// Projections publiques de `travel_dates`.
//
// POURQUOI — /api/v1/booking/<slug>/dates et /api/v1/booking/date/<id> sont
// appelées par le site public et le tunnel de commande, sans session. Un
// `select('*')` y publiait l'email du dernier éditeur, l'auteur et le motif des
// suppressions, le co-remplissage, les références BMS et deal AC de départ, les
// surcharges de marge, la couche `custom_display` et les dates non publiées, de
// test ou supprimées. En production et sans session back-office, ces routes ne
// lisent plus que les colonnes ci-dessous, une par usage réel du front.
//
// Valeurs réelles restantes (booked_seat, max_travelers, starting_price…) : le
// tunnel de commande en a besoin pour plafonner le nombre de voyageurs, basculer
// sur /checkout/complet et facturer le bon prix. Elles se déduisent de toute
// façon du checkout lui-même ; ce qui reste interne, c'est tout le reste.
//
// Toute colonne ajoutée ici est publiée à l'internet entier pour TOUTES les
// dates : n'en ajouter qu'avec l'usage front qui la justifie, et mettre à jour
// tests/unit/travelDateVisibility.test.mjs.

// /booking/<slug>/dates — page voyage (et sur-mesure) via app/composables/useDates.js :
// Voyages/InfoCard.vue, Voyages/DatesPricesContainer.vue → DatesPricesItem.vue,
// BookingStatus.vue, app/utils/getDateStatus.js, et la variante B du test A/B
// rdv (toUpcomingDates de app/utils/rdvVariant.js → RdvVariant/*).
export const PUBLIC_VOYAGE_DATES_COLUMNS = Object.freeze([
  'id', // liens /checkout?date_id=, clés localStorage des réservations en cours
  'travel_slug', // paramètre `voyage` des liens de checkout
  'published', // filtre client de useDates (le serveur ne renvoie plus que `true`)
  'departure_date',
  'return_date',
  'status', // getDateStatus : repli quand displayed_status est vide
  'displayed_status', // getDateStatus : prime sur status
  'booked_seat', // repli quand displayed_booked_seat est vide
  'displayed_booked_seat',
  'min_travelers', // « Groupe de X à Y personnes », statut calculé
  'max_travelers',
  'starting_price',
  'early_bird',
  'last_minute',
  'include_flight',
  'badges',
  'displayed_badges',
])

// /booking/date/<id> — tunnel de commande, app/pages/checkout/index.vue puis
// buildVoyageFromSanity (app/utils/voyageBuilders.js). Pas de filtre `published` :
// les dates privées ou sur-mesure, non publiées, se réservent par ce lien.
export const PUBLIC_CHECKOUT_DATE_COLUMNS = Object.freeze([
  'id',
  'travel_slug', // repli quand ?voyage= manque, lecture Sanity du voyage
  'departure_date',
  'return_date',
  'booked_seat', // places restantes = max_travelers - booked_seat (valeurs réelles)
  'max_travelers',
  'starting_price', // prix facturé, base de l'acompte
  'flight_price',
  'include_flight',
  'early_bird',
  'last_minute',
])

/**
 * La ligne complète (`select('*')`, dates supprimées sur ?includeDeleted) est
 * réservée au back-office : jeton de service Ulysse ou session `booking_token`.
 *
 * Hors production, la règle des autres lectures du BMS s'applique (voir
 * all-dates.get.js) : le BMS n'y demande pas de connexion, et sa fiche date
 * renvoie en PUT ce qu'elle a chargé. Lui servir la projection publique
 * effacerait des colonnes en base.
 */
export const readsFullTravelDates = (event) => {
  if (getUlysseServiceUser(event) ?? getBookingUserOrNull(event)) return true
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  return !isProdEnv
}
