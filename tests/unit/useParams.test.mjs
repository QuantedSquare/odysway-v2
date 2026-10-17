// Mises à jour de l'URL du tunnel (app/composables/useParams.js).
// `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp, defineComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useParams } from '../../app/composables/useParams.js'

const ouvrirTunnel = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/checkout', component: defineComponent({ render: () => null }) }],
  })
  const app = createApp({ render: () => null }).use(router)
  await router.push('/checkout?date_id=D&type=deposit&step=1&voyage=immersion-armoni')
  return { router, params: app.runWithContext(() => useParams()) }
}

test('reprise : le booked_id posé juste avant step=2 reste dans l\'URL', async () => {
  // Constat du 14/10/2026 : `?date_id=…&type=deposit&step=2&voyage=…`, sans
  // booked_id, et « Continuer » grisé à l'étape Voyageurs.
  const { router, params } = await ouvrirTunnel()
  params.addMultipleParams({ booked_id: 'B', date_id: undefined }, { replace: true })
  await params.addSingleParam('step', '2')
  assert.deepEqual(router.currentRoute.value.query, { type: 'deposit', step: '2', voyage: 'immersion-armoni', booked_id: 'B' })
})

test('kickstart : step=2 posé pendant que le booked_id arrive ne l\'efface pas', async () => {
  const { router, params } = await ouvrirTunnel()
  params.addMultipleParams({ booked_id: 'B', date_id: undefined })
  params.addSingleParam('step', '2')
  await params.addSingleParam('step', '2')
  assert.equal(router.currentRoute.value.query.booked_id, 'B')
  assert.equal(router.currentRoute.value.query.date_id, undefined)
  assert.equal(router.currentRoute.value.query.step, '2')
})

test('une fois les navigations terminées, l\'URL réelle redevient la base', async () => {
  const { router, params } = await ouvrirTunnel()
  await params.addSingleParam('step', '2')
  await router.push('/checkout?booked_id=X&step=3')
  await params.addSingleParam('type', 'balance')
  assert.deepEqual(router.currentRoute.value.query, { booked_id: 'X', step: '3', type: 'balance' })
})
