// Tests du mapping deal AC → ligne miroir (server/utils/dealMirror.js).
// Lanceur intégré de Node, sans dépendance : `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import dealMirror from '../../server/utils/dealMirror.js'

const { mapDealToMirrorRow, centimesEnEuros, oui, compterVoyageurs } = dealMirror

// Deal 16198 tel qu'AC le renvoie (anonymisé) : sur-mesure, 4 voyageurs,
// assurance Multirisque, acompte payé, ISO absent.
const dealAC = () => ({
  id: '16198',
  contact: '10492',
  group: '2',
  stage: '31',
  owner: '1',
  title: 'Sur-mesure au Japon',
  status: '0',
  value: '1187000',
  currency: 'eur',
  winProbability: 88,
  mdate: '2026-09-21T08:08:14-05:00',
  cdate: '2026-06-09T10:17:28-05:00',
  basePricePerTraveler: '280000',
  nbTravelers: '4',
  nbAdults: '4',
  nbChildren: '0',
  insurance: 'Multirisque',
  insuranceCommissionPrice: '16750',
  insuranceCommissionPerTraveler: '5000',
  alreadyPaid: '336000',
  restToPay: '851000',
  marginPerTraveler: '11200',
  totalMargin: '44800',
  country: 'JPN',
  departureDate: '2026-10-16',
  returnDate: '2026-10-31',
  traveler1: 'Anne_Arnaud_12/03/1961_FR',
  traveler2: 'Paul_Arnaud_02/07/1959_FR',
  traveler3: 'Lea_Arnaud',
  traveler4: 'Tom_Arnaud_',
  passportReceived: '||Oui||',
  dietReceived: ['Non'],
})

const lookups = {
  stages: { 31: 'En attente solde client' },
  pipelines: { 2: 'Voyageurs' },
  owners: { 1: 'Coralie Terminal' },
}

test('un champ absent d\'AC donne null, jamais 0 ni une valeur inventée', () => {
  const ligne = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: dealAC(), lookups })
  assert.equal(ligne.iso, null)
  assert.equal(ligne.zone_chapka, null)
  assert.equal(ligne.children_promo, null, 'plus de 80 € par défaut')
  assert.equal(ligne.max_children_age, null, 'plus de 12 ans par défaut')
  assert.equal(ligne.extension_price, null)
  assert.equal(ligne.acquisition_source, null)
  assert.equal(ligne.cancellation_fee, null)
  assert.equal(ligne.flight_plan_received, null)
})

test('montants AC en centimes convertis en euros ; zéro saisi reste zéro', () => {
  const ligne = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: { ...dealAC(), extensionPrice: '0' }, lookups })
  assert.equal(ligne.price_per_traveler, 2800)
  assert.equal(ligne.total_paid, 3360)
  assert.equal(ligne.rest_to_pay, 8510)
  assert.equal(ligne.total_margin, 448)
  assert.equal(ligne.extension_price, 0)
})

test('assurance : colonnes claires, anciennes colonnes inchangées', () => {
  const ligne = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: dealAC(), lookups })
  assert.equal(ligne.insurance_price_per_pax, 167.5)
  assert.equal(ligne.insurance_commission_per_pax, 50)
  // Historique conservé pour l'analytique : prix dans « commission », commission dans « price ».
  assert.equal(ligne.insurance_commission, 167.5)
  assert.equal(ligne.insurance_price_per_traveler, 50)

  const sansAssurance = mapDealToMirrorRow({
    dealId: 1, contactId: 1, lookups,
    fetchedDeal: { ...dealAC(), insurance: undefined, insuranceCommissionPrice: undefined, insuranceCommissionPerTraveler: undefined },
  })
  assert.equal(sansAssurance.insurance_choice, null, 'plus de « Aucune Assurance » inventé')
  assert.equal(sansAssurance.insurance_price_per_pax, null)
  assert.equal(sansAssurance.insurance_commission, 0, 'ancienne colonne : 0 comme avant')
})

test('valeur : euros depuis le webhook, centimes convertis depuis l\'API', () => {
  const viaApi = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: dealAC(), lookups })
  assert.equal(viaApi.total_value, 11870, 'l\'ancien repli lisait 1 187 000 €')
  const viaWebhook = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: dealAC(), body: { 'deal[value_raw]': '11870' } })
  assert.equal(viaWebhook.total_value, 11870)
})

test('libellés : charge du webhook d\'abord, sinon ceux lus dans AC', () => {
  const resync = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: dealAC(), lookups })
  assert.equal(resync.stage, 'En attente solde client')
  assert.equal(resync.pipeline_title, 'Voyageurs')
  assert.equal(resync.seller, 'Coralie Terminal')
  assert.equal(resync.pipeline_id, 2)
  assert.equal(resync.status, 'Ouvert')

  const webhook = mapDealToMirrorRow({
    dealId: 16198, contactId: 10492, fetchedDeal: dealAC(),
    body: { 'deal[stage_title]': 'Titre du webhook', 'deal[owner_firstname]': 'Lucie', 'deal[owner_lastname]': 'Crevel', 'deal[status]': '1' },
  })
  assert.equal(webhook.stage, 'Titre du webhook')
  assert.equal(webhook.seller, 'Lucie Crevel')
  assert.equal(webhook.status, 'Gagné')
})

test('dossier de départ (pipeline 4) : recopié comme les autres', () => {
  const ligne = mapDealToMirrorRow({ dealId: 16155, contactId: 10492, fetchedDeal: { ...dealAC(), group: '4', stage: '52' }, lookups })
  assert.equal(ligne.pipeline_id, 4)
})

test('voyageurs nommés et dates de naissance', () => {
  assert.deepEqual(compterVoyageurs(dealAC()), { nommes: 4, avecNaissance: 2 })
  assert.deepEqual(compterVoyageurs({}), { nommes: 0, avecNaissance: 0 })
  assert.deepEqual(compterVoyageurs({ traveler9: 'X_Y_01/01/2000_FR', traveler15: '  ' }), { nommes: 1, avecNaissance: 1 })
})

test('cases à cocher AC sous leurs différentes formes', () => {
  assert.equal(oui('Oui'), true)
  assert.equal(oui('||Oui||'), true)
  assert.equal(oui(['Oui']), true)
  assert.equal(oui('Non'), false)
  assert.equal(oui(['Non']), false)
  assert.equal(oui(''), null)
  assert.equal(oui(undefined), null)
  assert.equal(oui('||'), null)
})

test('centimes : texte, nombre, vide et non numérique', () => {
  assert.equal(centimesEnEuros('16750'), 167.5)
  assert.equal(centimesEnEuros(0), 0)
  assert.equal(centimesEnEuros(''), null)
  assert.equal(centimesEnEuros('abc'), null)
  assert.equal(centimesEnEuros(null), null)
})

test('created_at absent : la clé reste indéfinie pour ne pas écraser la valeur en place', () => {
  const d = { ...dealAC(), cdate: undefined }
  const ligne = mapDealToMirrorRow({ dealId: 16198, contactId: 10492, fetchedDeal: d })
  assert.equal(ligne.created_at, undefined)
  assert.equal(JSON.parse(JSON.stringify(ligne)).created_at, undefined)
})
