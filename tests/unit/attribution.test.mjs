// Attribution des leads : cookies de visite et classement en canal
// (server/utils/attribution.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import attribution from '../../server/utils/attribution.js'

const { nettoyerVisite, classerVisite, cookiesApresVisite, encoderCookie, decoderCookie, ligneAttribution, COOKIE_PREMIERE, COOKIE_DERNIERE } = attribution

const canal = visite => classerVisite(nettoyerVisite(visite)).canal

test('régies : gclid → Google Ads ; ?from-meta ou utm payant Meta → Meta Ads', () => {
  assert.equal(canal({ gclid: 'abc' }), 'Google Ads')
  assert.equal(canal({ wbraid: 'abc' }), 'Google Ads')
  assert.equal(canal({ from: 'g-ads' }), 'Google Ads')
  assert.equal(canal({ utm_source: 'google', utm_medium: 'cpc' }), 'Google Ads')
  assert.equal(canal({ from: 'meta', fbclid: 'x' }), 'Meta Ads')
  assert.equal(canal({ utm_source: 'facebook', utm_medium: 'paid_social' }), 'Meta Ads')
  assert.equal(canal({ utm_source: 'tiktok', utm_medium: 'cpc' }), 'Autre payant')
})

test('fbclid seul n\'est pas une pub : Facebook l\'ajoute à tous les liens sortants', () => {
  assert.equal(canal({ fbclid: 'x' }), 'Réseaux sociaux')
  assert.equal(canal({ fbclid: 'x', referrer: 'https://l.facebook.com/' }), 'Réseaux sociaux')
})

test('sans utm : le référent décide ; sans référent : Direct', () => {
  assert.equal(canal({ referrer: 'https://www.google.fr/' }), 'SEO')
  assert.equal(canal({ referrer: 'https://www.bing.com/search?q=x' }), 'SEO')
  assert.equal(canal({ referrer: 'https://www.qwant.com/' }), 'SEO')
  assert.equal(canal({ referrer: 'https://mail.google.com/' }), 'Email')
  assert.equal(canal({ referrer: 'https://chatgpt.com/' }), 'IA')
  assert.equal(canal({ referrer: 'https://www.instagram.com/' }), 'Réseaux sociaux')
  assert.equal(canal({ referrer: 'https://www.routard.com/forum' }), 'Site référent')
  assert.equal(canal({}), 'Direct')
  assert.equal(canal({ utm_source: 'brevo', utm_campaign: 'octobre' }), 'Email')
  assert.equal(canal({ utm_source: 'partenaire', utm_campaign: 'x' }), 'Autre campagne')
})

test('retour de paiement ou navigation interne : pas un référent', () => {
  assert.equal(nettoyerVisite({ referrer: 'https://checkout.stripe.com/c/pay' }).referrer, undefined)
  assert.equal(nettoyerVisite({ referrer: 'https://odysway.com/voyages' }).referrer, undefined)
  assert.equal(nettoyerVisite({ referrer: 'pas une url' }).referrer, undefined)
  assert.equal(canal({ referrer: 'https://checkout.stripe.com/' }), 'Direct')
})

test('nettoyage : champs inconnus retirés, valeurs bornées', () => {
  const v = nettoyerVisite({ utm_source: 'x'.repeat(500), email: 'a@b.c', ts: 1700000000000, landing: '/voyages/x' })
  assert.equal(v.utm_source.length, 200)
  assert.equal(v.email, undefined)
  assert.equal(v.ts, 1700000000000)
  assert.ok(nettoyerVisite({ ts: 'n/a' }).ts > 1700000000000)
})

test('cookies : la première visite est écrite une fois ; la dernière seulement par une visite marquée', () => {
  const directe = nettoyerVisite({ landing: '/' })
  const meta = nettoyerVisite({ from: 'meta', landing: '/voyages/laponie' })

  assert.deepEqual(cookiesApresVisite({ premiereActuelle: null, derniereActuelle: null, visite: directe }), { premiere: directe, derniere: directe })
  assert.deepEqual(cookiesApresVisite({ premiereActuelle: directe, derniereActuelle: directe, visite: meta }), { premiere: null, derniere: meta })
  assert.deepEqual(cookiesApresVisite({ premiereActuelle: directe, derniereActuelle: meta, visite: directe }), { premiere: null, derniere: null })
})

test('encodage du cookie : aller-retour, et valeur corrompue ignorée', () => {
  const v = nettoyerVisite({ gclid: 'abc', landing: '/voyages/japon', ts: 1700000000000 })
  assert.deepEqual(decoderCookie(encoderCookie(v)), v)
  assert.equal(decoderCookie('%%%'), null)
  assert.equal(decoderCookie(Buffer.from('[1,2]').toString('base64url')), null)
  assert.equal(decoderCookie(undefined), null)
})

test('ligne deal_attribution : première SEO, dernière Meta, click ids et ids GA / Meta', () => {
  const premiere = nettoyerVisite({ referrer: 'https://www.google.fr/', landing: '/blog/laponie', ts: 1750000000000 })
  const derniere = nettoyerVisite({ from: 'meta', fbclid: 'IwAR1', utm_source: 'facebook', utm_campaign: 'laponie', landing: '/voyages/laponie/lp', variante: 'B', ts: 1759000000000 })
  const ligne = ligneAttribution({
    dealId: '16730',
    formulaire: 'Tunnel',
    cookies: {
      [COOKIE_PREMIERE]: encoderCookie(premiere),
      [COOKIE_DERNIERE]: encoderCookie(derniere),
      _ga: 'GA1.1.123456789.1750000000',
      _fbp: 'fb.1.1750000000000.987',
      _gcl_aw: 'GCL.1750000000.Cj0KCQ',
    },
  })

  assert.equal(ligne.deal_id, 16730)
  assert.equal(ligne.formulaire, 'Tunnel')
  assert.equal(ligne.first_channel, 'SEO')
  assert.equal(ligne.first_source, 'google.fr')
  assert.equal(ligne.first_landing, '/blog/laponie')
  assert.equal(ligne.first_at, new Date(1750000000000).toISOString())
  assert.equal(ligne.last_channel, 'Meta Ads')
  assert.equal(ligne.last_source, 'facebook')
  assert.equal(ligne.last_campaign, 'laponie')
  assert.equal(ligne.fbclid, 'IwAR1')
  assert.equal(ligne.fbc, 'fb.1.1759000000000.IwAR1')
  assert.equal(ligne.fbp, 'fb.1.1750000000000.987')
  assert.equal(ligne.gclid, 'Cj0KCQ')
  assert.equal(ligne.ga_client_id, '123456789.1750000000')
  assert.equal(ligne.variante, 'B')
  assert.deepEqual(ligne.touches, { first: premiere, last: derniere })
})

test('ligne deal_attribution : sans cookie, visites inconnues (null), pas « Direct »', () => {
  const ligne = ligneAttribution({ dealId: 1, cookies: {} })
  assert.equal(ligne.first_channel, null)
  assert.equal(ligne.last_channel, null)
  assert.equal(ligne.touches, null)
  assert.equal(ligne.fbc, null)
})

test('ligne deal_attribution : le cookie _fbc de Meta prime sur celui reconstruit', () => {
  const visite = nettoyerVisite({ fbclid: 'abc', ts: 1 })
  const ligne = ligneAttribution({ dealId: 1, cookies: { [COOKIE_PREMIERE]: encoderCookie(visite), _fbc: 'fb.1.5.abc' } })
  assert.equal(ligne.fbc, 'fb.1.5.abc')
  assert.equal(ligne.last_channel, 'Réseaux sociaux')
})

test('contexte du visiteur : IP et navigateur gardés pour chaque lead, consent_ads plus écrit', () => {
  const requete = { ip: '203.0.113.7', userAgent: 'Mozilla/5.0 (iPhone)' }
  const ligne = ligneAttribution({ dealId: 1, cookies: {}, requete })
  assert.equal(ligne.client_ip, '203.0.113.7')
  assert.equal(ligne.client_user_agent, 'Mozilla/5.0 (iPhone)')
  assert.equal('consent_ads' in ligne, false)
  const sansRequete = ligneAttribution({ dealId: 1, cookies: {} })
  assert.equal(sansRequete.client_ip, null)
  assert.equal(sansRequete.client_user_agent, null)
})
