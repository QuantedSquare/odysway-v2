// Garde d'accès CRM — server/utils/bookingSession.js.
//
// Verrouille qui peut lire ou écrire un deal ActiveCampaign : session
// back-office signée, jeton de service Ulysse, ou rien. Un déploiement Vercel
// (preview COMME production) est bâti avec NODE_ENV=production : la seule
// dérogation est un serveur de dev local.
//
// Exécution : `npm test` (node --test, aucune dépendance).

import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, it } from 'node:test'

import jwt from 'jsonwebtoken'

import { getSuperadmins, isAllowedEmail } from '../server/utils/bookingAuth.js'

const SECRET = 'secret-de-test-booking-jwt'
const SERVICE_TOKEN = 'jeton-de-service-ulysse-de-test'

let requireCrmAccess
let getCrmAccessOrNull

before(async () => {
  // bookingSession.js consomme isAllowedEmail/getSuperadmins par auto-import
  // Nitro. Hors serveur, on expose les vraies implémentations en global pour
  // tester la sémantique réelle de la liste d'autorisation.
  globalThis.isAllowedEmail = isAllowedEmail
  globalThis.getSuperadmins = getSuperadmins
  const mod = await import('../server/utils/bookingSession.js')
  requireCrmAccess = mod.requireCrmAccess
  getCrmAccessOrNull = mod.getCrmAccessOrNull
})

// Événement h3 minimal : getCookie/getHeader ne lisent que les en-têtes bruts.
const fakeEvent = (headers = {}) => ({
  node: { req: { headers, method: 'GET', url: '/api/v1/ac/deals/16447' } },
})

const withCookie = token => fakeEvent({ cookie: `booking_token=${token}` })

const signe = (payload, secret = SECRET) => jwt.sign(payload, secret)

const envInitial = {}
beforeEach(() => {
  for (const cle of ['NODE_ENV', 'BOOKING_JWT_SECRET', 'ULYSSE_SERVICE_TOKEN', 'SUPERADMIN_EMAILS']) {
    envInitial[cle] = process.env[cle]
  }
  process.env.NODE_ENV = 'production'
  process.env.BOOKING_JWT_SECRET = SECRET
  process.env.ULYSSE_SERVICE_TOKEN = SERVICE_TOKEN
  delete process.env.SUPERADMIN_EMAILS
})
afterEach(() => {
  for (const [cle, valeur] of Object.entries(envInitial)) {
    if (valeur === undefined) delete process.env[cle]
    else process.env[cle] = valeur
  }
})

const attendre401 = (fn) => {
  assert.throws(fn, (err) => {
    assert.equal(err.statusCode, 401, `statut attendu 401, reçu ${err.statusCode}`)
    return true
  })
}

describe('requireCrmAccess — déploiement (NODE_ENV=production)', () => {
  it('refuse une requête sans aucune preuve', () => {
    attendre401(() => requireCrmAccess(fakeEvent()))
  })

  it('accepte une session booking_token @odysway.com', () => {
    const user = requireCrmAccess(withCookie(signe({ sub: '1', email: 'sophie@odysway.com', name: 'Sophie' })))
    assert.equal(user.email, 'sophie@odysway.com')
    assert.equal(user.role, 'user')
  })

  it('refuse un jeton signé avec un autre secret', () => {
    const contrefait = signe({ email: 'sophie@odysway.com' }, 'mauvais-secret')
    attendre401(() => requireCrmAccess(withCookie(contrefait)))
  })

  it('refuse un jeton valide dont l\'email est hors liste', () => {
    attendre401(() => requireCrmAccess(withCookie(signe({ email: 'tiers@example.com' }))))
  })

  it('refuse un cookie qui n\'est pas un JWT', () => {
    attendre401(() => requireCrmAccess(withCookie('pas-un-jwt')))
  })

  it('refuse quand BOOKING_JWT_SECRET n\'est pas configuré', () => {
    delete process.env.BOOKING_JWT_SECRET
    attendre401(() => requireCrmAccess(withCookie(signe({ email: 'sophie@odysway.com' }))))
  })

  it('accepte le jeton de service Ulysse et attribue l\'action à l\'utilisateur réel', () => {
    const user = requireCrmAccess(fakeEvent({
      'x-ulysse-service-token': SERVICE_TOKEN,
      'x-ulysse-user': 'marc@odysway.com',
    }))
    assert.equal(user.role, 'service')
    assert.equal(user.email, 'marc@odysway.com')
  })

  it('refuse un jeton de service erroné de même longueur', () => {
    const faux = 'X'.repeat(SERVICE_TOKEN.length)
    assert.equal(faux.length, SERVICE_TOKEN.length)
    attendre401(() => requireCrmAccess(fakeEvent({ 'x-ulysse-service-token': faux })))
  })

  it('refuse un jeton de service de longueur différente sans lever d\'erreur crypto', () => {
    attendre401(() => requireCrmAccess(fakeEvent({ 'x-ulysse-service-token': 'court' })))
    attendre401(() => requireCrmAccess(fakeEvent({ 'x-ulysse-service-token': `${SERVICE_TOKEN}-rallonge` })))
  })

  it('refuse quand ULYSSE_SERVICE_TOKEN n\'est pas configuré', () => {
    delete process.env.ULYSSE_SERVICE_TOKEN
    attendre401(() => requireCrmAccess(fakeEvent({ 'x-ulysse-service-token': SERVICE_TOKEN })))
  })

  it('reconnaît un superadmin hors domaine @odysway.com', () => {
    process.env.SUPERADMIN_EMAILS = 'externe@example.com'
    const user = requireCrmAccess(withCookie(signe({ email: 'externe@example.com' })))
    assert.equal(user.role, 'superadmin')
  })
})

describe('requireCrmAccess — serveur de dev local', () => {
  it('laisse passer sans preuve quand NODE_ENV n\'est pas "production"', () => {
    process.env.NODE_ENV = 'development'
    assert.doesNotThrow(() => requireCrmAccess(fakeEvent()))
  })

  it('un déploiement de preview est bien traité comme la production', () => {
    // Vercel bâtit les previews avec NODE_ENV=production : la garde tient même
    // si VERCEL_ENV vaut "preview".
    process.env.NODE_ENV = 'production'
    process.env.VERCEL_ENV = 'preview'
    attendre401(() => requireCrmAccess(fakeEvent()))
    delete process.env.VERCEL_ENV
  })
})

describe('getCrmAccessOrNull — variante non bloquante', () => {
  it('renvoie null en déploiement sans preuve, au lieu de lever', () => {
    assert.equal(getCrmAccessOrNull(fakeEvent()), null)
  })

  it('renvoie l\'utilisateur quand la session est valide', () => {
    const user = getCrmAccessOrNull(withCookie(signe({ email: 'sophie@odysway.com' })))
    assert.equal(user.email, 'sophie@odysway.com')
  })

  it('renvoie un utilisateur factice sur un serveur de dev local', () => {
    process.env.NODE_ENV = 'development'
    assert.equal(getCrmAccessOrNull(fakeEvent()).role, 'dev')
  })
})
