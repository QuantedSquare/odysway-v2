// Test A/B « prise de rendez-vous » sur la page voyage.
//
// A (témoin)  : page voyage actuelle.
// B (rdv)     : la prise de rendez-vous passe devant, les dates sont réduites.
//
// La variante vient de ?variante=… (seul paramètre gardé dans la clé de cache ISR,
// cf. routeRules dans nuxt.config.ts) :
//   absent, "a" ou "ga"  → A
//   toute autre valeur   → B

import dayjs from 'dayjs'
import { getDateStatus } from '~/utils/getDateStatus'

export const AB_TEST_NAME = 'voyage_rdv'
export const VARIANT_QUERY_KEY = 'variante'
const CONTROL_VALUES = ['', 'a', 'ga']

export function resolveVoyageVariant(query = {}) {
  const raw = query[VARIANT_QUERY_KEY]
  const value = String((Array.isArray(raw) ? raw[0] : raw) ?? '').trim().toLowerCase()
  return CONTROL_VALUES.includes(value) ? 'A' : 'B'
}

// Textes par défaut de la variante B. Sanity (page_voyage.rdvVariant, puis
// voyage.rdvBlock pour le bloc principal) les remplace champ par champ.
export const RDV_VARIANT_DEFAULTS = {
  enabled: true,
  calLink: 'odysway/rendez-vous',
  infoCard: {
    rdvButtonText: 'Prendre rendez-vous',
    reassureText: '20 minutes au téléphone avec un spécialiste. Sans engagement.',
    datesButtonText: 'Voir les dates de départ',
    guaranteedLabel: 'Départs garantis',
    scheduledLabel: 'Départs programmés',
  },
  rdvSection: {
    kicker: 'Avant de réserver',
    title: 'Avant de choisir une date, parlons de votre séjour',
    // 'both' : paragraphe + puces ; 'text' ou 'bullets' pour n'en garder qu'un.
    displayMode: 'both',
    text: 'Ce voyage se prépare à quelques détails près : la meilleure période selon vos envies, le vol qui part de chez vous, l\'âge des enfants, la chambre individuelle. Vingt minutes suffisent à tout caler.',
    bullets: [
      'La période la plus favorable selon vos dates',
      'Le vol depuis votre ville, et son prix réel',
      'Ce que donnent les journées avec des enfants',
      'Les places qui restent vraiment sur chaque départ',
      'Un devis écrit, vols compris, envoyé après l\'appel',
      'Ce qui est fourni sur place, ce qu\'il reste à emporter',
    ],
    // Signature : la référence teamMember (Sanity) apporte photo et nom ; sans elle,
    // specialistName + initiale. specialistTitle prime sur le poste du membre.
    specialist: null,
    specialistName: 'Lucie',
    specialistTitle: 'spécialiste Grand Nord',
    specialistSubtitle: 'Répond aussi sur WhatsApp, du lundi au vendredi, de 9 h à 19 h',
    slotsTitle: 'Prochains créneaux',
    slotsSubtitle: 'Téléphone ou visio, 20 minutes',
    slotsCount: 3,
    seeAllSlotsText: 'Voir tous les créneaux',
    slotsFooter: 'Vous repartez de l\'appel avec un devis écrit, vols compris.',
    noSlotsText: 'Choisissez le créneau qui vous convient dans notre agenda.',
  },
  band: {
    text: 'Vous hésitez entre deux dates, ou vous attendez le bon prix de vol ? Nous comparons ensemble en vingt minutes.',
    buttonText: 'Prendre rendez-vous',
  },
  dates: {
    title: 'Les prochains départs',
    subtitle: 'Vous savez déjà quelle date vous convient ? Réservez directement.',
    bookButtonText: 'S\'inscrire ou poser une option',
    moreText: 'Voir plus de dates',
    lessText: 'Voir moins de dates',
    initialCount: 3,
    emptyText: 'Aucun départ programmé pour le moment. Parlons-en : nous pouvons ouvrir une date ou organiser un voyage sur mesure.',
  },
  nudge: {
    title: 'Votre question n\'est pas dans la FAQ ?',
    subtitle: 'Posez-la de vive voix, la réponse prend deux minutes.',
    buttonText: 'Prendre rendez-vous',
  },
  bottomBar: {
    datesText: 'Voir les dates',
    rdvButtonText: 'Prendre rendez-vous',
  },
}

const isEmpty = value => value === undefined
  || value === null
  || value === ''
  || (Array.isArray(value) && value.length === 0)

// Fusion profonde « Sanity sinon défaut » : une valeur vide dans Sanity ne masque
// jamais le défaut. Les tableaux sont remplacés en bloc, pas fusionnés.
export function withRdvDefaults(defaults, ...overrides) {
  const result = { ...defaults }
  for (const override of overrides) {
    if (!override || typeof override !== 'object') continue
    for (const [key, value] of Object.entries(override)) {
      if (key.startsWith('_') || isEmpty(value)) continue
      const base = result[key]
      result[key] = base && typeof base === 'object' && !Array.isArray(base) && typeof value === 'object' && !Array.isArray(value)
        ? withRdvDefaults(base, value)
        : value
    }
  }
  return result
}

// Départs réservables pour la liste réduite de la variante B. Reprend les règles
// d'affichage de DatesPricesItem (places affichées, statut « quasi confirmé »,
// fenêtres early bird / last minute) pour que les deux variantes montrent les mêmes
// statuts et les mêmes prix.
export function toUpcomingDates(dates = [], { closingDays = 30, lastMinutePrice = 0, earlyBirdPrice = 0 } = {}) {
  const today = dayjs()
  return dates
    .filter(date => dayjs(date.departure_date).isAfter(today.add(closingDays, 'day')))
    .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))
    .map((date) => {
      const bookedSeat = Number(date.displayed_booked_seat) > 0 ? Number(date.displayed_booked_seat) : date.booked_seat
      const effectiveStatus = date.displayed_status || date.status
      const isTreatedAsConfirmed = effectiveStatus === 'soon_confirmed' && bookedSeat === date.min_travelers - 1
      const earlyBird = today.isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false
      const lastMinute = dayjs(date.departure_date).diff(today, 'day') <= 31 ? date.last_minute : false
      const discount = lastMinute ? (+lastMinutePrice || 90) : (earlyBird ? +earlyBirdPrice || 0 : 0)
      return {
        ...date,
        booked_seat: bookedSeat,
        status: getDateStatus({ ...date, status: isTreatedAsConfirmed ? 'confirmed' : effectiveStatus }),
        price: date.starting_price - discount,
        originalPrice: discount > 0 ? date.starting_price : null,
        checkoutType: dayjs(date.departure_date).isBefore(today.add(30, 'day')) ? 'full' : 'deposit',
      }
    })
    .filter(date => date.status.status !== 'full')
}
