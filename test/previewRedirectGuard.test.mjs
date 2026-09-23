// Garde de /preview/disable — server/middleware/preview-redirect-guard.js.
//
// La route de @nuxtjs/sanity redirige vers `?redirect=` sans contrôle : sur
// une preview publique, ce serait une redirection ouverte.
//
// Exécution : `npm test` (node --test, aucune dépendance).

import assert from 'node:assert/strict'
import { before, describe, it } from 'node:test'

import { createError, getQuery } from 'h3'

let garde

before(async () => {
  globalThis.defineEventHandler = handler => handler
  globalThis.getQuery = getQuery
  globalThis.createError = createError
  garde = (await import('../server/middleware/preview-redirect-guard.js')).default
})

const requete = path => ({ path, node: { req: { url: path, headers: {} } } })

const refuse = path => assert.throws(() => garde(requete(path)), err => err.statusCode === 400)
const passe = path => assert.doesNotThrow(() => garde(requete(path)))

describe('preview-redirect-guard', () => {
  it('accepte un chemin du site', () => {
    passe('/preview/disable?redirect=/voyages/trek-nepal')
    passe('/preview/disable')
  })

  it('refuse une URL externe', () => {
    refuse('/preview/disable?redirect=https://exemple-malveillant.com')
    refuse('/preview/disable?redirect=//exemple-malveillant.com')
    refuse('/preview/disable?redirect=/\\exemple-malveillant.com')
    refuse('/preview/disable?redirect=javascript:alert(1)')
  })

  it('ne touche pas aux autres routes', () => {
    passe('/voyages?redirect=https://exemple.com')
  })
})
