// Règles du compte de l'Espace Voyageur : changement d'email et suppression
// (app/utils/espaceReglesCompte.js, server/utils/espaceCompte.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { changementEmailTermine, erreurNouvelEmail, messageErreurEmail, suppressionConfirmee } from '../../app/utils/espaceReglesCompte.js'
import espaceCompte from '../../server/utils/espaceCompte.js'

const jeton = charge => `x.${Buffer.from(JSON.stringify(charge)).toString('base64url')}.y`
const connecteIlYA = minutes => jeton({ amr: [{ method: 'otp', timestamp: Math.floor(Date.now() / 1000) - minutes * 60 }] })

test('suppression : case cochée ET mot saisi', () => {
  assert.equal(suppressionConfirmee({ conservationComprise: true, confirmation: 'SUPPRIMER' }), true)
  assert.equal(suppressionConfirmee({ conservationComprise: true, confirmation: '  supprimer ' }), true)
  assert.equal(suppressionConfirmee({ conservationComprise: false, confirmation: 'SUPPRIMER' }), false)
  assert.equal(suppressionConfirmee({ conservationComprise: 'true', confirmation: 'SUPPRIMER' }), false)
  assert.equal(suppressionConfirmee({ conservationComprise: true, confirmation: 'SUPPRIME' }), false)
  assert.equal(suppressionConfirmee({ conservationComprise: true }), false)
  assert.equal(suppressionConfirmee(), false)
  // Le serveur revérifie avec la même règle, corps absent compris.
  assert.equal(espaceCompte.confirmationValide(null), false)
  assert.equal(espaceCompte.confirmationValide({ conservationComprise: true, confirmation: 'SUPPRIMER' }), true)
})

test('suppression : connexion de moins de 10 minutes exigée côté serveur', () => {
  assert.equal(espaceCompte.connexionRecente(connecteIlYA(2)), true)
  assert.equal(espaceCompte.connexionRecente(connecteIlYA(30)), false)
  assert.equal(espaceCompte.connexionRecente(null), false)
  assert.equal(espaceCompte.connexionRecente('pas.un-jeton.valide'), false)
  assert.equal(espaceCompte.connexionRecente(jeton({ sub: 'u-1' })), false)
})

test('membre de l\'équipe : par user_id ou par email exact', () => {
  const client = { id: 'u-1', email: 'lea@odysway.com' }
  assert.equal(espaceCompte.estMembreEquipe([{ user_id: 'u-1', email: 'autre@odysway.com' }], client), true)
  assert.equal(espaceCompte.estMembreEquipe([{ user_id: null, email: ' Lea@Odysway.com ' }], client), true)
  // Le `ilike` de la requête peut ramener plus large : seule l'égalité compte.
  assert.equal(espaceCompte.estMembreEquipe([{ user_id: 'u-2', email: 'lea@odysway.co' }], client), false)
  assert.equal(espaceCompte.estMembreEquipe([], client), false)
  assert.equal(espaceCompte.estMembreEquipe(null, client), false)
  // Une ligne sans user_id ne correspond pas à un compte sans id.
  assert.equal(espaceCompte.estMembreEquipe([{ user_id: null, email: 'x@y.fr' }], { id: null, email: 'z@y.fr' }), false)
})

test('suppression : seuls les profils remplis pour soi sont effacés', () => {
  const profils = [
    { deal_traveler_id: 'p1', user_id: 'u-1', scan_path: 'p1/a.jpg' },
    { deal_traveler_id: 'p2', user_id: 'u-1', scan_path: null },
    { deal_traveler_id: 'p3', user_id: null, scan_path: 'p3/b.pdf' },
    { deal_traveler_id: 'p4', user_id: 'u-2', scan_path: 'p4/c.png' },
  ]
  assert.deepEqual(espaceCompte.profilsAEffacer(profils, 'u-1'), [
    { placeId: 'p1', scanPath: 'p1/a.jpg' },
    { placeId: 'p2', scanPath: null },
  ])
  assert.deepEqual(espaceCompte.profilsAEffacer(profils, null), [])
  assert.deepEqual(espaceCompte.profilsAEffacer(null, 'u-1'), [])
})

test('changement d\'email : adresse contrôlée avant l\'envoi', () => {
  assert.equal(erreurNouvelEmail('nouvelle@email.fr', 'camille@email.fr'), null)
  assert.equal(erreurNouvelEmail('', 'camille@email.fr'), 'Saisissez votre nouvelle adresse.')
  assert.equal(erreurNouvelEmail('pas-une-adresse', 'camille@email.fr'), 'Cette adresse email n\'est pas valide.')
  assert.equal(erreurNouvelEmail(' Camille@Email.fr ', 'camille@email.fr'), 'C\'est déjà l\'adresse de votre compte.')
})

test('changement d\'email : terminé quand le compte porte la nouvelle adresse', () => {
  assert.equal(changementEmailTermine({ email: 'nouvelle@email.fr' }, ' Nouvelle@email.fr'), true)
  assert.equal(changementEmailTermine({ email: 'camille@email.fr' }, 'nouvelle@email.fr'), false)
  // Premier des deux codes : Supabase ne renvoie qu'un message, pas de compte.
  assert.equal(changementEmailTermine(null, 'nouvelle@email.fr'), false)
  assert.equal(changementEmailTermine({ msg: 'Confirmation link accepted' }, 'nouvelle@email.fr'), false)
})

test('changement d\'email : erreurs Supabase traduites', () => {
  assert.match(messageErreurEmail({ code: 'email_exists' }), /Retrouver un dossier/)
  assert.match(messageErreurEmail({ message: 'A user with this email address has already been registered' }), /autre compte/)
  assert.equal(messageErreurEmail({ code: 'email_address_invalid' }), 'Cette adresse email n\'est pas valide.')
  assert.equal(messageErreurEmail({ code: 'over_email_send_rate_limit' }), null)
})
