// Dates proposées par un porteur et remplissage des départs (shared/portageDates.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import portageDates from '../../shared/portageDates.js'

const { nettoyerProposition, remplissage } = portageDates
const aujourdhui = '2026-10-22'

test('proposition : saisie complète → ligne à écrire, prix en centimes', () => {
  const { valeur, erreurs } = nettoyerProposition({
    depart: '2027-05-10', retour: '2027-05-17', participantsMin: '6', participantsMax: 12, prixSouhaite: '1490', note: '  Pendant les vacances de printemps  ',
  }, { aujourdhui })
  assert.deepEqual(erreurs, [])
  assert.deepEqual(valeur, {
    depart: '2027-05-10', retour: '2027-05-17', participants_min: 6, participants_max: 12, prix_souhaite: 149000, note: 'Pendant les vacances de printemps',
  })
})

test('proposition : seuls départ et retour sont obligatoires', () => {
  const { valeur, erreurs } = nettoyerProposition({ depart: '2027-05-10', retour: '2027-05-10' }, { aujourdhui })
  assert.deepEqual(erreurs, [])
  assert.equal(valeur.participants_min, null)
  assert.equal(valeur.prix_souhaite, null)
  assert.equal(valeur.note, null)
})

test('proposition : chaque erreur dit quoi corriger, rien n\'est écrit', () => {
  const cas = [
    [{}, ['la date de départ', 'la date de retour']],
    [{ depart: '2026-10-22', retour: '2026-10-30' }, ['une date de départ à venir']],
    [{ depart: '2027-05-10', retour: '2027-05-09' }, ['un retour après le départ']],
    [{ depart: '2027-05-10', retour: '2027-08-10' }, ['un séjour de 60 jours au plus']],
    [{ depart: '2027-02-30', retour: '2027-03-02' }, ['la date de départ']],
    [{ depart: '2027-05-10', retour: '2027-05-17', participantsMin: 12, participantsMax: 6 }, ['un minimum inférieur au maximum']],
    [{ depart: '2027-05-10', retour: '2027-05-17', participantsMax: 0 }, ['un maximum de participants entre 1 et 200']],
    [{ depart: '2027-05-10', retour: '2027-05-17', prixSouhaite: 1490.5 }, ['un prix souhaité en euros, sans centimes']],
  ]
  for (const [saisie, attendu] of cas) {
    const { valeur, erreurs } = nettoyerProposition(saisie, { aujourdhui })
    assert.deepEqual(erreurs, attendu, JSON.stringify(saisie))
    assert.equal(valeur, null)
  }
  assert.deepEqual(nettoyerProposition(null, { aujourdhui }).erreurs, ['la date de départ', 'la date de retour'])
})

const date = {
  id: 'd1', departure_date: '2027-05-10', return_date: '2027-05-17', min_travelers: 6, max_travelers: 12, booked_seat: 7, published: true,
}

test('remplissage : payés, en cours, options ; corbeille et perdus ignorés', () => {
  const r = remplissage({
    date,
    aujourdhui,
    reservations: [
      { booked_places: 2, deal: { pipeline_id: 7, stage_id: '84', total_paid: 600 } },
      { booked_places: 2, deal: { pipeline_id: 7, stage_id: '85', total_paid: 0 } },
      { booked_places: 1, deal: { pipeline_id: 2, stage_id: '6', total_paid: 0 } },
      { booked_places: 2, is_option: true, deal: { pipeline_id: 7, stage_id: '87', total_paid: 0 } },
      { booked_places: 0, deal: { pipeline_id: 7, stage_id: '88', total_paid: 0 } },
      { booked_places: 0, deal: null },
      { booked_places: 3, deal: { pipeline_id: 3, stage_id: '84', total_paid: 900 } },
      { booked_places: 1, deal: { pipeline_id: 7, stage_id: '84', total_paid: 300, status: 'Perdu' } },
    ],
  })
  assert.equal(r.dossiersPayes, 3)
  assert.equal(r.placesPayees, 5)
  assert.equal(r.options, 1)
  assert.equal(r.placesOptions, 2)
  assert.equal(r.enCours, 2)
  assert.equal(r.placesReservees, 7)
  assert.equal(r.garanti, false)
  assert.equal(r.statut, 'ouverte')
  assert.equal(r.fermeture, '2027-04-10')
})

test('remplissage : départ garanti quand les places payées atteignent le minimum', () => {
  const r = remplissage({ date, aujourdhui, reservations: [{ booked_places: 6, deal: { pipeline_id: 7, stage_id: '84', total_paid: 1 } }] })
  assert.equal(r.garanti, true)
  assert.equal(remplissage({ date: { ...date, min_travelers: null }, aujourdhui, reservations: [] }).garanti, false)
})

test('remplissage : statut du départ', () => {
  const statut = (d, jour = aujourdhui, closingDays) => remplissage({ date: { ...date, ...d }, aujourdhui: jour, closingDays }).statut
  assert.equal(statut({}), 'ouverte')
  assert.equal(statut({ published: false }), 'en_preparation')
  assert.equal(statut({ booked_seat: 12 }), 'complete')
  assert.equal(statut({}, '2027-04-20'), 'fermee')
  assert.equal(statut({}, '2027-04-20', 10), 'ouverte')
  assert.equal(statut({}, '2027-06-01'), 'passee')
})
