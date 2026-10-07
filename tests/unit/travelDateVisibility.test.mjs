// Projections publiques de travel_dates.
//
// Ces tests verrouillent le contrat de server/utils/travelDateVisibility.js :
// la liste des colonnes qu'un anonyme peut lire sur /api/v1/booking/<slug>/dates
// et /api/v1/booking/date/<id>, et les dates qu'il peut y voir. Ils échouent
// dès qu'une colonne interne y entre par inadvertance, ou qu'une route repasse
// à `select('*')` pour un anonyme en production.
//
// Exécution : `npm run test:unit` (node --test, aucune dépendance).

import assert from 'node:assert/strict'
import { before, beforeEach, describe, it } from 'node:test'

import jwt from 'jsonwebtoken'

import { buildVoyageFromSanity } from '../../app/utils/voyageBuilders.js'
import { getDateStatus } from '../../app/utils/getDateStatus.js'
import { getSuperadmins, isAllowedEmail } from '../../server/utils/bookingAuth.js'
import {
  PUBLIC_CHECKOUT_DATE_COLUMNS,
  PUBLIC_VOYAGE_DATES_COLUMNS,
  readsFullTravelDates,
} from '../../server/utils/travelDateVisibility.js'

// Colonnes de public.travel_dates (information_schema, septembre 2026). Une
// colonne de projection absente d'ici ferait échouer la requête PostgREST, donc
// la page voyage et le tunnel pour tout le monde.
const TRAVEL_DATES_COLUMNS = [
  'id', 'created_at', 'published', 'travel_slug', 'departure_date',
  'return_date', 'max_travelers', 'min_travelers', 'booked_seat',
  'include_flight', 'flight_price', 'badges', 'starting_price', 'early_bird',
  'last_minute', 'is_custom_travel', 'custom_display', 'displayed_min_travelers',
  'displayed_max_travelers', 'displayed_booked_seat', 'displayed_include_flight',
  'displayed_badges', 'displayed_starting_price', 'displayed_last_minute',
  'displayed_early_bird', 'status', 'is_indiv_travel', 'deleted', 'is_test',
  'closing_days', 'displayed_status', 'updated_at', 'last_editor',
  'departure_id', 'bms_reference', 'travel_type_prefix', 'co_filling',
  'margin_override_per_traveler', 'real_traveler_count_override', 'deleted_at',
  'deleted_by', 'deleted_reason', 'deleted_batch',
]

// Ce qu'aucune des deux projections ne doit jamais publier.
const INTERDITES = [
  'last_editor', 'deleted_by', 'deleted_reason', 'deleted_batch', 'deleted_at',
  'co_filling', 'bms_reference', 'departure_id', 'travel_type_prefix',
  'margin_override_per_traveler', 'real_traveler_count_override', 'is_test',
  'deleted', 'custom_display', 'displayed_starting_price',
  'displayed_max_travelers', 'displayed_min_travelers', 'updated_at',
  'created_at',
]

const PROJECTIONS = {
  PUBLIC_VOYAGE_DATES_COLUMNS,
  PUBLIC_CHECKOUT_DATE_COLUMNS,
}

// Une date telle que la base la stocke, avec une couche custom_display active.
const dateComplete = {
  id: '6f1c2a4e-8d3b-4f5a-9c7e-1b2d3e4f5a6b',
  created_at: '2026-01-10T09:00:00+00:00',
  published: true,
  travel_slug: 'perou-communautes-andines',
  departure_date: '2027-04-12',
  return_date: '2027-04-27',
  max_travelers: 12,
  min_travelers: 4,
  booked_seat: 3,
  include_flight: true,
  flight_price: 900,
  badges: 'Nouveau',
  starting_price: 2400,
  early_bird: true,
  last_minute: false,
  is_custom_travel: false,
  custom_display: true,
  displayed_min_travelers: 4,
  displayed_max_travelers: 10,
  displayed_booked_seat: 8,
  displayed_include_flight: true,
  displayed_badges: 'Dernières places',
  displayed_starting_price: 2290,
  displayed_last_minute: false,
  displayed_early_bird: true,
  status: 'soon_confirmed',
  is_indiv_travel: false,
  deleted: false,
  is_test: false,
  closing_days: 30,
  displayed_status: 'confirmed',
  updated_at: '2026-09-01T12:00:00+00:00',
  last_editor: 'jeanne.martin@odysway.com',
  departure_id: '48213',
  bms_reference: 'PER-2027-04',
  travel_type_prefix: 'GRP',
  co_filling: 2,
  margin_override_per_traveler: 350,
  real_traveler_count_override: 5,
  deleted_at: null,
  deleted_by: null,
  deleted_reason: null,
  deleted_batch: null,
}

const pick = (row, columns) => Object.fromEntries(columns.filter(c => c in row).map(c => [c, row[c]]))

describe('projections publiques de travel_dates', () => {
  for (const [nom, colonnes] of Object.entries(PROJECTIONS)) {
    it(`${nom} est figée, pour qu'aucun appelant ne l'étende à chaud`, () => {
      assert.ok(Object.isFrozen(colonnes))
    })

    it(`${nom} ne contient aucune colonne interne`, () => {
      for (const cle of INTERDITES) {
        assert.ok(!colonnes.includes(cle), `"${cle}" ne doit pas être publiée par ${nom}`)
      }
    })

    it(`${nom} ne cite que des colonnes réelles, sans doublon`, () => {
      for (const cle of colonnes) {
        assert.ok(TRAVEL_DATES_COLUMNS.includes(cle), `"${cle}" n'existe pas dans travel_dates`)
      }
      assert.equal(new Set(colonnes).size, colonnes.length)
    })
  }

  it('page voyage : liste blanche exacte', () => {
    assert.deepEqual([...PUBLIC_VOYAGE_DATES_COLUMNS].sort(), [
      'badges', 'booked_seat', 'departure_date', 'displayed_badges',
      'displayed_booked_seat', 'displayed_status', 'early_bird', 'id',
      'include_flight', 'last_minute', 'max_travelers', 'min_travelers',
      'published', 'return_date', 'starting_price', 'status', 'travel_slug',
    ])
  })

  it('tunnel de commande : liste blanche exacte', () => {
    assert.deepEqual([...PUBLIC_CHECKOUT_DATE_COLUMNS].sort(), [
      'booked_seat', 'departure_date', 'early_bird', 'flight_price', 'id',
      'include_flight', 'last_minute', 'max_travelers', 'return_date',
      'starting_price', 'travel_slug',
    ])
  })

  it('le tunnel construit le même voyage avec la projection qu\'avec la ligne complète', () => {
    // app/pages/checkout/index.vue → buildVoyageFromSanity
    const travel = {
      title: 'Pérou, communautés andines',
      slug: 'perou-communautes-andines',
      destinations: [{ title: 'Pérou', iso: 'PE', chapka: '3' }],
      pricing: { earlyBirdReduction: 100, lastMinuteReduction: 90, childrenPromo: 50 },
      availabilityTypes: ['groupe'],
    }
    const complet = buildVoyageFromSanity(dateComplete, travel)
    const projete = buildVoyageFromSanity(pick(dateComplete, PUBLIC_CHECKOUT_DATE_COLUMNS), travel)
    assert.deepEqual(projete, complet)
    assert.equal(projete.remainingSeats, 9)
    assert.equal(projete.startingPrice, 240000)
  })

  it('la page voyage calcule le même statut avec la projection qu\'avec la ligne complète', () => {
    const variantes = [
      dateComplete,
      { ...dateComplete, displayed_status: null },
      { ...dateComplete, displayed_status: null, status: null, booked_seat: 12 },
      { ...dateComplete, displayed_status: 'guaranteed' },
    ]
    for (const date of variantes) {
      assert.deepEqual(getDateStatus(pick(date, PUBLIC_VOYAGE_DATES_COLUMNS)), getDateStatus(date))
    }
  })
})

// --- Les routes elles-mêmes -------------------------------------------------
//
// Les handlers sont importés tels quels ; leurs auto-imports Nitro (supabase,
// useRuntimeConfig, getUlysseServiceUser, getBookingUserOrNull,
// readsFullTravelDates, funnelReporter, projections) sont exposés en global. Le
// faux client Supabase se comporte comme PostgREST : `eq` filtre, `select`
// projette. On juge donc ce que la route RENVOIE, pas la forme de sa requête.

const SERVICE_TOKEN = 'jeton-de-service-ulysse-de-test'
const JWT_SECRET = 'secret-de-test-booking-jwt'

const fakeSupabase = (table) => {
  const from = () => {
    let rows = [...table]
    let columns = '*'
    const project = row => (columns === '*' ? { ...row } : pick(row, columns.split(',')))
    const result = () => ({ data: rows.map(project), error: null })
    const builder = {
      select(cols) {
        columns = cols
        return builder
      },
      eq(column, value) {
        rows = rows.filter(r => r[column] === value)
        return builder
      },
      order: () => builder,
      maybeSingle: () => Promise.resolve({ data: rows[0] ? project(rows[0]) : null, error: null }),
      then: (resolve, reject) => Promise.resolve(result()).then(resolve, reject),
    }
    return builder
  }
  return { from }
}

const fakeEvent = ({ path, params, headers = {} }) => {
  const responseHeaders = {}
  return {
    path,
    method: 'GET',
    context: { params },
    node: {
      req: { headers, method: 'GET', url: path },
      res: { setHeader: (name, value) => { responseHeaders[name.toLowerCase()] = value } },
    },
    responseHeaders,
  }
}

const ulysse = { 'x-ulysse-service-token': SERVICE_TOKEN }
const sessionBms = () => ({
  cookie: `booking_token=${jwt.sign({ email: 'jeanne.martin@odysway.com', sub: 'g-1' }, JWT_SECRET)}`,
})

const dates = [
  dateComplete,
  { ...dateComplete, id: 'brouillon', published: false },
  { ...dateComplete, id: 'test', is_test: true },
  { ...dateComplete, id: 'supprimee', deleted: true },
  { ...dateComplete, id: 'autre-voyage', travel_slug: 'islande-hiver' },
]

// Environnement Nuxt (config.public.environment = VERCEL_ENV) : la projection
// ne s'applique qu'en production, comme les autres gardes du BMS sur main.
let environment = 'production'
let slugDates
let dateById

before(async () => {
  // Tout build Nitro fige NODE_ENV à "production".
  process.env.NODE_ENV = 'production'
  process.env.ULYSSE_SERVICE_TOKEN = SERVICE_TOKEN
  process.env.BOOKING_JWT_SECRET = JWT_SECRET
  globalThis.isAllowedEmail = isAllowedEmail
  globalThis.getSuperadmins = getSuperadmins
  const session = await import('../../server/utils/bookingSession.js')
  globalThis.getUlysseServiceUser = session.getUlysseServiceUser
  globalThis.getBookingUserOrNull = session.getBookingUserOrNull
  globalThis.useRuntimeConfig = () => ({ public: { environment } })
  globalThis.readsFullTravelDates = readsFullTravelDates
  globalThis.PUBLIC_VOYAGE_DATES_COLUMNS = PUBLIC_VOYAGE_DATES_COLUMNS
  globalThis.PUBLIC_CHECKOUT_DATE_COLUMNS = PUBLIC_CHECKOUT_DATE_COLUMNS
  globalThis.funnelReporter = {
    funnelCreateError: ({ statusCode, code, message }) => Object.assign(new Error(message), { statusCode, code }),
  }
  slugDates = (await import('../../server/api/v1/booking/[slug]/dates.get.js')).default
  dateById = (await import('../../server/api/v1/booking/date/[dateId].get.js')).default
})

beforeEach(() => {
  environment = 'production'
  globalThis.supabase = fakeSupabase(dates)
})

describe('GET /api/v1/booking/<slug>/dates', () => {
  const appel = (headers, query = '') => {
    const event = fakeEvent({
      path: `/api/v1/booking/perou-communautes-andines/dates${query}`,
      params: { slug: 'perou-communautes-andines' },
      headers,
    })
    return slugDates(event).then(body => ({ body, headers: event.responseHeaders }))
  }

  it('anonyme en production : seulement les dates publiées, réelles et non supprimées', async () => {
    const { body } = await appel({}, '?includeDeleted=true')
    assert.deepEqual(body.map(d => d.id), [dateComplete.id])
  })

  it('anonyme en production : seulement les colonnes de la liste blanche', async () => {
    const { body, headers } = await appel({})
    assert.deepEqual(Object.keys(body[0]).sort(), [...PUBLIC_VOYAGE_DATES_COLUMNS].sort())
    assert.ok(!JSON.stringify(body).includes('jeanne.martin@odysway.com'))
    assert.equal(headers['cache-control'], undefined)
  })

  for (const [qui, headers] of [['jeton Ulysse', ulysse], ['session BMS', null]]) {
    it(`${qui} : toutes les colonnes et toutes les dates du voyage, jamais en cache partagé`, async () => {
      const { body, headers: reponse } = await appel(headers ?? sessionBms(), '?includeDeleted=true')
      assert.deepEqual(body.map(d => d.id).sort(), [dateComplete.id, 'brouillon', 'supprimee', 'test'].sort())
      assert.equal(body[0].last_editor, 'jeanne.martin@odysway.com')
      assert.equal(reponse['cache-control'], 'private, no-store')
    })
  }

  it('session BMS sans includeDeleted : la corbeille reste fermée', async () => {
    const { body } = await appel(sessionBms())
    assert.ok(!body.some(d => d.id === 'supprimee'))
    assert.ok(body.some(d => d.id === 'brouillon'))
  })

  it('cookie booking_token forgé : traité comme un anonyme', async () => {
    const forge = { cookie: `booking_token=${jwt.sign({ email: 'jeanne.martin@odysway.com' }, 'autre-secret')}` }
    const { body } = await appel(forge, '?includeDeleted=true')
    assert.deepEqual(Object.keys(body[0]).sort(), [...PUBLIC_VOYAGE_DATES_COLUMNS].sort())
  })

  it('hors production (preview, local) : ligne complète, le BMS n\'y exige pas de connexion', async () => {
    environment = 'preview'
    const { body } = await appel({})
    assert.equal(body[0].last_editor, 'jeanne.martin@odysway.com')
    assert.ok(body.some(d => d.id === 'brouillon'))
  })
})

describe('GET /api/v1/booking/date/<id>', () => {
  const appel = (id, headers = {}, query = '') => {
    const event = fakeEvent({ path: `/api/v1/booking/date/${id}${query}`, params: { dateId: id }, headers })
    return dateById(event).then(body => ({ body, headers: event.responseHeaders }))
  }

  it('anonyme en production : seulement les colonnes du tunnel de commande', async () => {
    const { body } = await appel(dateComplete.id)
    assert.deepEqual(Object.keys(body).sort(), [...PUBLIC_CHECKOUT_DATE_COLUMNS].sort())
    for (const cle of INTERDITES) assert.equal(body[cle], undefined, `"${cle}" a fuité`)
  })

  it('anonyme en production : une date non publiée reste réservable par son lien', async () => {
    const { body } = await appel('brouillon')
    assert.equal(body.id, 'brouillon')
  })

  it('anonyme en production : une date de test ou supprimée est introuvable, même avec includeDeleted', async () => {
    for (const id of ['test', 'supprimee']) {
      await assert.rejects(appel(id, {}, '?includeDeleted=true'), { statusCode: 404, code: 'DATE_NOT_FOUND' })
    }
  })

  it('session BMS : la ligne complète, la date supprimée sur includeDeleted, jamais en cache partagé', async () => {
    const { body, headers } = await appel('supprimee', sessionBms(), '?includeDeleted=true')
    assert.deepEqual(Object.keys(body).sort(), Object.keys(dateComplete).sort())
    assert.equal(headers['cache-control'], 'private, no-store')
  })

  it('jeton Ulysse : la ligne complète', async () => {
    const { body } = await appel('test', ulysse)
    assert.deepEqual(Object.keys(body).sort(), Object.keys(dateComplete).sort())
  })
})
