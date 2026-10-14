// Conversions serveur envoyées à Stape (server/utils/conversions.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import conversions from '../../server/utils/conversions.js'
import attribution from '../../server/utils/attribution.js'

const { normaliserTelephone, consentementDonne, evenementLead, evenementAchat, envoyer } = conversions

const sha256 = v => createHash('sha256').update(v).digest('hex')

// Ligne deal_attribution d'un prospect venu d'une pub Meta, consentement donné.
const ligneMeta = () => attribution.ligneAttribution({
  dealId: 16730,
  formulaire: 'Tunnel',
  cookies: {
    ody_ft: attribution.encoderCookie(attribution.nettoyerVisite({ from: 'meta', fbclid: 'IwAR1', utm_campaign: 'laponie', ts: 1759000000000 })),
    _ga: 'GA1.1.123456789.1750000000',
    _fbp: 'fb.1.1750000000000.987',
    ody_consent: 'granted',
  },
})

test('téléphone en E.164 : numéro français sans indicatif, 00, +, illisible', () => {
  assert.equal(normaliserTelephone('06 12 34 56 78'), '+33612345678')
  assert.equal(normaliserTelephone('+33 6 12 34 56 78'), '+33612345678')
  assert.equal(normaliserTelephone('0032 470 12 34 56'), '+32470123456')
  assert.equal(normaliserTelephone('+41791234567'), '+41791234567')
  assert.equal(normaliserTelephone('12'), null)
  assert.equal(normaliserTelephone(''), null)
})

test('consentement : seul « granted » laisse partir une conversion ; sans ligne, rien', () => {
  assert.equal(consentementDonne(ligneMeta()), true)
  assert.equal(consentementDonne({ consent_ads: 'denied' }), false)
  assert.equal(consentementDonne({ consent_ads: null }), false)
  assert.equal(consentementDonne(null), false)
  const sansBanniere = attribution.ligneAttribution({ dealId: 1, cookies: { ody_consent: 'peut-être' } })
  assert.equal(sansBanniere.consent_ads, null)
})

test('lead : event_id du navigateur, identifiants Meta / GA4, coordonnées normalisées', () => {
  const e = evenementLead({
    dealId: 16730,
    eventId: 'lead_abc',
    formulaire: 'Tunnel',
    attribution: ligneMeta(),
    contact: { email: '  Jean.Dupont@Gmail.com ', phone: '06 12 34 56 78', firstname: 'Jean', lastname: 'Dupont', isoContact: 'fr' },
    voyage: { slug: 'laponie', titre: 'Laponie' },
    requete: { ip: '203.0.113.7', userAgent: 'Mozilla/5.0', pageLocation: 'https://odysway.com/checkout' },
  })

  assert.equal(e.event_name, 'generate_lead')
  assert.equal(e.event_id, 'lead_abc')
  assert.equal(e.event_source, 'server')
  assert.equal(e.client_id, '123456789.1750000000')
  assert.equal(e.ip_override, '203.0.113.7')
  assert.equal(e.user_data.email_address, 'jean.dupont@gmail.com')
  assert.equal(e.user_data.sha256_email_address, sha256('jean.dupont@gmail.com'))
  assert.equal(e.user_data.phone_number, '+33612345678')
  assert.deepEqual(e.user_data.address, { first_name: 'Jean', last_name: 'Dupont', country: 'FR' })
  assert.equal(e.fbc, 'fb.1.1759000000000.IwAR1')
  assert.equal(e['x-fb-ck-fbc'], 'fb.1.1759000000000.IwAR1')
  assert.equal(e['x-fb-ck-fbp'], 'fb.1.1750000000000.987')
  assert.equal(e.first_channel, 'Meta Ads')
  assert.equal(e.deal_id, '16730')
  assert.deepEqual(e.items, [{ item_id: 'laponie', item_name: 'Laponie' }])
  // Champs vides retirés : pas de gclid, pas de value.
  assert.equal('gclid' in e, false)
  assert.equal('value' in e, false)
})

test('lead sans id navigateur ni cookie GA : ids de repli stables, propres au deal', () => {
  const e = evenementLead({ dealId: 42, attribution: { consent_ads: 'granted' }, contact: { email: 'a@b.fr' } })
  assert.equal(e.event_id, 'lead_42')
  assert.equal(e.client_id, 'ody.42')
  assert.equal(e.user_data.phone_number, undefined)
})

test('achat : même event_id et transaction_id que le navigateur, valeur en euros', () => {
  const e = evenementAchat({
    dealId: 16730,
    contactId: '10492',
    transactionId: 'pi_3Abc',
    valeurCentimes: '389000',
    attribution: ligneMeta(),
    contact: { email: 'jean@exemple.fr', firstname: 'Jean' },
    voyage: { slug: 'laponie', titre: 'Laponie', nbVoyageurs: '2' },
    typePaiement: 'CB',
  })
  assert.equal(e.event_name, 'purchase')
  assert.equal(e.event_id, 'purchase_16730')
  assert.equal(e.transaction_id, 'pi_3Abc')
  assert.equal(e.value, 3890)
  assert.equal(e.currency, 'EUR')
  assert.equal(e.user_id, '10492')
  assert.equal(e.payment_type, 'CB')
  assert.deepEqual(e.items, [{ item_id: 'laponie', item_name: 'Laponie', quantity: 2 }])
  assert.equal(e.last_channel, 'Meta Ads')
})

test('achat Alma : le dealId sert de transaction_id, comme côté navigateur', () => {
  const e = evenementAchat({ dealId: 777, transactionId: '777', valeurCentimes: 120050, attribution: { consent_ads: 'granted' } })
  assert.equal(e.transaction_id, '777')
  assert.equal(e.value, 1200.5)
})

test('envoi : sans STAPE_SERVER_URL rien ne part ; sinon POST JSON sur /data ; une erreur ne lève pas', async () => {
  const fetchOrigine = globalThis.fetch
  const urlOrigine = process.env.STAPE_SERVER_URL
  const appels = []
  try {
    delete process.env.STAPE_SERVER_URL
    globalThis.fetch = (...args) => {
      appels.push(args)
      return Promise.resolve({ ok: true, status: 200 })
    }
    assert.equal(await envoyer({ event_name: 'purchase', deal_id: '1' }), false)
    assert.equal(appels.length, 0)

    process.env.STAPE_SERVER_URL = 'https://sst.odysway.com'
    assert.equal(await envoyer({ event_name: 'purchase', deal_id: '1', event_id: 'purchase_1' }), true)
    assert.equal(String(appels[0][0]), 'https://sst.odysway.com/data')
    assert.equal(appels[0][1].method, 'POST')
    assert.deepEqual(JSON.parse(appels[0][1].body), { event_name: 'purchase', deal_id: '1', event_id: 'purchase_1' })

    globalThis.fetch = () => Promise.resolve({ ok: false, status: 400 })
    assert.equal(await envoyer({ event_name: 'purchase', deal_id: '1' }), false)
    globalThis.fetch = () => Promise.reject(new Error('réseau'))
    assert.equal(await envoyer({ event_name: 'purchase', deal_id: '1' }), false)
  }
  finally {
    globalThis.fetch = fetchOrigine
    if (urlOrigine === undefined) delete process.env.STAPE_SERVER_URL
    else process.env.STAPE_SERVER_URL = urlOrigine
  }
})

test('achat : IP et navigateur du lead, pas ceux du webhook de paiement', () => {
  const e = evenementAchat({
    dealId: 1,
    transactionId: 'pi_1',
    valeurCentimes: 100,
    attribution: { consent_ads: 'granted', client_ip: '203.0.113.7', client_user_agent: 'Mozilla/5.0 (iPhone)' },
  })
  assert.equal(e.ip_override, '203.0.113.7')
  assert.equal(e.user_agent, 'Mozilla/5.0 (iPhone)')
  // Inconnus : absents, et non vides — le Data Client sait alors qu'il n'en a pas.
  const sans = evenementAchat({ dealId: 1, attribution: { consent_ads: 'granted' } })
  assert.equal('ip_override' in sans, false)
  assert.equal('user_agent' in sans, false)
})

test('envoi : l\'en-tête secret part quand STAPE_SECRET est définie', async () => {
  const fetchOrigine = globalThis.fetch
  const avant = { url: process.env.STAPE_SERVER_URL, secret: process.env.STAPE_SECRET }
  const entetes = []
  try {
    process.env.STAPE_SERVER_URL = 'https://sst.odysway.com'
    globalThis.fetch = (_url, options) => {
      entetes.push(options.headers)
      return Promise.resolve({ ok: true, status: 200 })
    }
    delete process.env.STAPE_SECRET
    await envoyer({ event_name: 'purchase', deal_id: '1' })
    process.env.STAPE_SECRET = 's3cret'
    await envoyer({ event_name: 'purchase', deal_id: '1' })
    assert.equal('x-ody-secret' in entetes[0], false)
    assert.equal(entetes[1]['x-ody-secret'], 's3cret')
  }
  finally {
    globalThis.fetch = fetchOrigine
    for (const [cle, valeur] of [['STAPE_SERVER_URL', avant.url], ['STAPE_SECRET', avant.secret]]) {
      if (valeur === undefined) delete process.env[cle]
      else process.env[cle] = valeur
    }
  }
})
