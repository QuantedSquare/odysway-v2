// Garde deny-by-default du back-office — server/middleware/backoffice-auth.js.
//
// Verrouille la frontière entre ce que le site public peut appeler sous
// /api/v1/booking et /api/v1/ac (liste blanche) et tout le reste, réservé au
// jeton Ulysse ou à une session @odysway.com. Une preview Vercel est bâtie
// avec NODE_ENV=production : elle doit se comporter comme la prod.
//
// Exécution : `npm test` (node --test, aucune dépendance).

import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, it } from 'node:test'

import { getSuperadmins, isAllowedEmail } from '../server/utils/bookingAuth.js'

const SERVICE_TOKEN = 'jeton-de-service-ulysse-de-test'

let garde

before(async () => {
  // Le middleware et bookingSession.js consomment des auto-imports Nitro. Hors
  // serveur, on expose les vraies implémentations en global.
  globalThis.isAllowedEmail = isAllowedEmail
  globalThis.getSuperadmins = getSuperadmins
  globalThis.defineEventHandler = handler => handler
  const session = await import('../server/utils/bookingSession.js')
  globalThis.requireCrmAccess = session.requireCrmAccess
  globalThis.isLocalDev = session.isLocalDev
  garde = (await import('../server/middleware/backoffice-auth.js')).default
})

// Événement h3 minimal : getCookie/getHeader lisent les en-têtes bruts.
const requete = (method, path, headers = {}) => ({
  method,
  path,
  node: { req: { headers, method, url: path } },
})

const envInitial = {}
beforeEach(() => {
  for (const cle of ['NODE_ENV', 'BOOKING_JWT_SECRET', 'ULYSSE_SERVICE_TOKEN']) {
    envInitial[cle] = process.env[cle]
  }
  process.env.NODE_ENV = 'production'
  process.env.BOOKING_JWT_SECRET = 'secret-de-test-booking-jwt'
  process.env.ULYSSE_SERVICE_TOKEN = SERVICE_TOKEN
})
afterEach(() => {
  for (const [cle, valeur] of Object.entries(envInitial)) {
    if (valeur === undefined) delete process.env[cle]
    else process.env[cle] = valeur
  }
})

const passe = (method, path, headers) =>
  assert.doesNotThrow(() => garde(requete(method, path, headers)), `${method} ${path} devrait passer`)

const refuse = (method, path, headers) =>
  assert.throws(() => garde(requete(method, path, headers)), (err) => {
    assert.equal(err.statusCode, 401, `${method} ${path} : statut attendu 401, reçu ${err.statusCode}`)
    // Un refus d'accès n'est pas un incident du tunnel (funnelErrorHook).
    assert.equal(err.data?.code, 'BACKOFFICE_AUTH_REQUIRED')
    return true
  })

describe('backoffice-auth — routes publiques du site et du tunnel', () => {
  it('laisse passer les lectures du site public', () => {
    passe('GET', '/api/v1/booking/travel-dates?slugs=perou,japon')
    passe('GET', '/api/v1/booking/travels-by-date')
    passe('GET', '/api/v1/booking/travelers-count')
    passe('GET', '/api/v1/booking/last-minute-voyages')
    passe('GET', '/api/v1/booking/trek-nepal/dates')
    passe('GET', '/api/v1/booking/date/7c9e6679-7425-40de-944b-e07fc1f90ae7')
  })

  it('laisse passer le tunnel de commande', () => {
    passe('GET', '/api/v1/booking/booking-exists?booked_id=abc')
    passe('GET', '/api/v1/booking/purchase-data?booked_id=abc')
    passe('POST', '/api/v1/booking/booked_date/option')
    passe('POST', '/api/v1/booking/trek-nepal/date/abc/kickstart')
    passe('POST', '/api/v1/booking/trek-nepal/date/abc/assign-deal')
    passe('POST', '/api/v1/ac/deals')
    passe('GET', '/api/v1/ac/deals/deal-from-bms?bookedId=abc')
    passe('POST', '/api/v1/ac/deals/update-with-bms?bookedId=abc')
    passe('POST', '/api/v1/ac/deals/enrich')
    passe('GET', '/api/v1/ac/deals/16447')
  })

  it('laisse passer les webhooks à jeton propre', () => {
    passe('POST', '/api/v1/ac/webhooks/dealUpdate?token=x')
    passe('POST', '/api/v1/ac/backfill?token=x')
  })

  it('traite HEAD comme GET', () => {
    passe('HEAD', '/api/v1/booking/travel-dates')
  })

  it('ne s\'occupe pas des routes hors back-office', () => {
    passe('POST', '/api/v1/stripe?bookedId=abc')
    passe('GET', '/api/v1/search/voyages?keyword=perou')
    passe('GET', '/voyages/trek-nepal')
  })
})

describe('backoffice-auth — tout le reste est fermé (NODE_ENV=production)', () => {
  it('refuse le back-office des dates', () => {
    refuse('GET', '/api/v1/booking/all-dates')
    refuse('GET', '/api/v1/booking/trash')
    refuse('POST', '/api/v1/booking/add-date')
    refuse('GET', '/api/v1/booking/trek-nepal/date/abc/booked')
    refuse('PUT', '/api/v1/booking/trek-nepal/date/abc')
    refuse('DELETE', '/api/v1/booking/trek-nepal/date/abc')
    refuse('POST', '/api/v1/booking/booked_date/extend-option')
    refuse('GET', '/api/v1/booking/margins/pilotage')
  })

  it('refuse les lectures CRM par id ou par email', () => {
    refuse('GET', '/api/v1/ac/contacts?email=client@example.com')
    refuse('GET', '/api/v1/ac/contacts/42')
    refuse('GET', '/api/v1/ac/contacts/42/deals')
    refuse('GET', '/api/v1/ac/deals/16447/custom')
    refuse('GET', '/api/v1/ac/deals/16447/inspect')
    refuse('POST', '/api/v1/ac/deals/16447')
  })

  it('une route publique ne l\'est que pour sa méthode', () => {
    refuse('POST', '/api/v1/booking/travel-dates')
    refuse('DELETE', '/api/v1/ac/deals/16447')
    refuse('GET', '/api/v1/booking/trek-nepal/date/abc/kickstart')
  })

  it('une route ajoutée demain sous le préfixe est fermée par défaut', () => {
    refuse('GET', '/api/v1/booking/nouvelle-route')
    refuse('GET', '/api/v1/ac/nouvelle-route')
  })

  it('la query string ne peut pas ouvrir une route', () => {
    refuse('GET', '/api/v1/booking/all-dates?x=/api/v1/booking/travel-dates')
  })

  it('les chemins détournés restent sous garde', () => {
    refuse('GET', '/api/v1/booking/travel-dates/../all-dates')
    refuse('GET', '/api/v1/%62ooking/all-dates')
    refuse('GET', '/API/V1/BOOKING/all-dates')
    refuse('GET', '//api/v1/booking/all-dates')
    refuse('GET', '/api/v1/booking/%E0%A4%A')
  })

  it('accepte le jeton de service Ulysse', () => {
    passe('GET', '/api/v1/booking/all-dates', { 'x-ulysse-service-token': SERVICE_TOKEN })
    passe('DELETE', '/api/v1/booking/trek-nepal/date/abc', { 'x-ulysse-service-token': SERVICE_TOKEN })
  })

  it('refuse un faux jeton de service', () => {
    refuse('GET', '/api/v1/booking/all-dates', { 'x-ulysse-service-token': 'faux' })
  })
})

describe('backoffice-auth — serveur de dev local', () => {
  it('reste permissif quand NODE_ENV n\'est pas "production"', () => {
    process.env.NODE_ENV = 'development'
    passe('GET', '/api/v1/booking/all-dates')
    passe('GET', '/api/v1/ac/contacts?email=client@example.com')
  })

  it('une preview Vercel est traitée comme la production', () => {
    process.env.NODE_ENV = 'production'
    process.env.VERCEL_ENV = 'preview'
    refuse('GET', '/api/v1/booking/all-dates')
    delete process.env.VERCEL_ENV
  })
})
