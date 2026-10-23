// Configuration publique de l'Espace Voyageur (app/utils/espaceConfig.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESPACE_INDISPONIBLE, reglagesEspaceManquants } from '../../app/utils/espaceConfig.js'
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
