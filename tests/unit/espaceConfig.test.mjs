// Configuration publique de l'Espace Voyageur (app/utils/espaceConfig.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESPACE_INDISPONIBLE, RETOUR_NON_AUTORISE, reglagesEspaceManquants, urlRetourEspace } from '../../app/utils/espaceConfig.js'
import { messageErreurAuth } from '../../app/utils/espaceMotDePasse.js'

test('reglagesEspaceManquants : clé vide, absente ou faite d\'espaces', () => {
  const url = 'https://ufyskkwszklmrgcifanb.supabase.co'
  assert.deepEqual(reglagesEspaceManquants({ supabaseUrl: url, supabaseKey: 'sb_publishable_x' }), [])
  assert.deepEqual(reglagesEspaceManquants({ supabaseUrl: url, supabaseKey: '' }), ['supabaseKey'])
  assert.deepEqual(reglagesEspaceManquants({ supabaseUrl: url, supabaseKey: '  ' }), ['supabaseKey'])
  assert.deepEqual(reglagesEspaceManquants({ supabaseUrl: url }), ['supabaseKey'])
  assert.deepEqual(reglagesEspaceManquants(undefined), ['supabaseUrl', 'supabaseKey'])
})

test('messageErreurAuth : espace indisponible', () => {
  assert.equal(messageErreurAuth({ code: ESPACE_INDISPONIBLE }), 'Espace voyageur momentanément indisponible. Réessayez un peu plus tard.')
})

test('urlRetourEspace : seulement les origines déclarées dans Supabase Auth', () => {
  assert.equal(urlRetourEspace('https://odysway.com'), 'https://odysway.com/mon-espace/connexion')
  assert.equal(urlRetourEspace('https://dev.odysway.com'), 'https://dev.odysway.com/mon-espace/connexion')
  assert.equal(urlRetourEspace('http://localhost:3000'), 'http://localhost:3000/mon-espace/connexion')
  assert.equal(urlRetourEspace('https://odysway-v2-de4r87qtb-odysway.vercel.app'), 'https://odysway-v2-de4r87qtb-odysway.vercel.app/mon-espace/connexion')
  assert.equal(urlRetourEspace('https://odysway-v2-git-dev-odysway.vercel.app'), 'https://odysway-v2-git-dev-odysway.vercel.app/mon-espace/connexion')
  // Absentes de Supabase : Google renverrait le client sur Ulysse.
  for (const o of ['http://localhost:3001', 'http://127.0.0.1:3000', 'https://www.odysway.com', 'https://odysway.com.evil.fr', 'https://odysway-v2-x-odysway.vercel.app.evil.fr', 'https://ulysse-odysway.vercel.app', '', undefined]) {
    assert.equal(urlRetourEspace(o), null, String(o))
  }
})

test('messageErreurAuth : retour Google non autorisé', () => {
  assert.match(messageErreurAuth({ code: RETOUR_NON_AUTORISE }), /code par email/)
})
