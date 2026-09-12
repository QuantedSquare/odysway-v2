// Portée de revalidation ISR par type de document (server/utils/revalidationRegistry.js).
//
// Trois dérives sont surveillées ici, parce que chacune s'est déjà produite :
//   1. un type de document ajouté dans le Studio sans être classé — c'est ainsi
//      que publier `siteBanner` ne revalidait aucun chemin ;
//   2. un chemin du registre qui ne correspond à aucune route ISR de
//      nuxt.config.ts (route renommée, ou oubliée dans le registre) ;
//   3. les pages d'un voyage, dont le nombre dépend de ses drapeaux.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'
import registry from '../../server/utils/revalidationRegistry.js'

const { REVALIDATION_REGISTRY, revalidationScopeFor, voyagePaths } = registry

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const lire = chemin => readFileSync(join(racine, chemin), 'utf8')

// --- Types de documents réellement enregistrés dans le Studio ---------------
function typesDeDocuments() {
  const index = lire('cms/schemaTypes/index.ts')
  const liste = index.split('export const schemaTypes')[1] || ''
  const imports = [...index.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*'\.\/([\w/]+)'/g)]
    .map(([, symbole, chemin]) => ({ symbole, fichier: `${chemin}.ts` }))
    .filter(({ symbole }) => new RegExp(`^\\s*${symbole},?\\s*$`, 'm').test(liste))

  const types = new Set()
  for (const { symbole, fichier } of imports) {
    const source = lire(join('cms/schemaTypes', fichier))
    // On s'ancre sur le symbole exporté : plusieurs fichiers déclarent des
    // objets imbriqués avec defineType() avant leur propre type de document.
    const debut = source.indexOf(`export const ${symbole} = defineType({`)
    assert.notEqual(debut, -1, `${symbole} introuvable dans ${basename(fichier)}`)
    const entete = source.slice(debut, source.indexOf('fields:', debut))
    const nom = entete.match(/name:\s*'([^']+)'/)?.[1]
    const genre = entete.match(/type:\s*'(document|object)'/)?.[1]
    assert.ok(nom, `pas de name: dans ${basename(fichier)}`)
    // homePageType n'écrit pas de `type`, qui vaut document par défaut.
    if (genre !== 'object') types.add(nom)
  }
  return types
}

test('chaque type de document du Studio est classé dans le registre', () => {
  const manquants = [...typesDeDocuments()].filter(type => !REVALIDATION_REGISTRY[type]).sort()
  assert.deepEqual(manquants, [], `types non classés (ils déclencheraient chacun un balayage complet) : ${manquants.join(', ')}`)
})

test('le registre ne classe pas de type disparu du Studio', () => {
  const types = typesDeDocuments()
  const orphelins = Object.keys(REVALIDATION_REGISTRY).filter(type => !types.has(type)).sort()
  assert.deepEqual(orphelins, [], `types absents du Studio : ${orphelins.join(', ')}`)
})

// --- Cohérence avec les routes ISR -----------------------------------------
// Les chemins fixes du registre doivent exister comme route cachée en production.
function routesIsr() {
  const config = lire('nuxt.config.ts')
  const bloc = config.slice(config.indexOf('routeRules: {'), config.indexOf('features: {'))
  return [...bloc.matchAll(/'(\/[^']*)':\s*\{\s*isr:/g)].map(([, route]) => route)
}

const couvertParIsr = (chemin, routes) => routes.some(route => (
  route.endsWith('/**')
    ? chemin === route.slice(0, -3) || chemin.startsWith(route.slice(0, -2))
    : chemin === route
))

test('les chemins fixes du registre correspondent à des routes ISR', () => {
  const routes = routesIsr()
  assert.ok(routes.length > 15, 'routeRules ISR illisibles — le format a changé')

  const doc = { _id: 'id', slug: 'un-slug' }
  const horsIsr = []
  for (const [type, portee] of Object.entries(REVALIDATION_REGISTRY)) {
    if (portee.kind !== 'page') continue
    for (const chemin of portee.paths(doc)) {
      if (!couvertParIsr(chemin, routes)) horsIsr.push(`${type} -> ${chemin}`)
    }
  }
  assert.deepEqual(horsIsr, [], `chemins sans route ISR : ${horsIsr.join(', ')}`)
})

test('un type inconnu tombe en balayage complet, jamais en silence', () => {
  const { scope, known } = revalidationScopeFor('typeQuiNExistePas')
  assert.equal(known, false)
  assert.equal(scope.kind, 'global')
  assert.equal(revalidationScopeFor(undefined).known, false)
  assert.equal(revalidationScopeFor('siteBanner').scope.kind, 'global')
  assert.equal(revalidationScopeFor('checkout').scope.kind, 'none')
})

// --- Pages d'un voyage ------------------------------------------------------
test('voyage listé : sa page, sa landing /lp et les listings', () => {
  assert.deepEqual(voyagePaths({ slug: 'perou-immersion', availabilityTypes: ['group', 'custom'] }), [
    '/voyages/perou-immersion',
    '/voyages/perou-immersion/lp',
    '/voyages',
    '/prochains-departs',
    '/',
  ])
})

test('sur-mesure seul publié : page par lien seul, sans les listings', () => {
  assert.deepEqual(voyagePaths({ slug: 'kenya', availabilityTypes: ['custom'], customPagePublished: true }), [
    '/voyages/kenya',
    '/voyages/kenya/lp',
    '/sur-mesure/kenya',
  ])
})

test('voyage en portage publié : /portage/<slug> et non /sur-mesure/<slug>', () => {
  assert.deepEqual(voyagePaths({ slug: 'crete-yoga', availabilityTypes: ['custom'], portage: true, customPagePublished: true }), [
    '/voyages/crete-yoga',
    '/voyages/crete-yoga/lp',
    '/portage/crete-yoga',
  ])
})

test('sur-mesure seul non publié : aucune page par lien seul', () => {
  assert.deepEqual(voyagePaths({ slug: 'brouillon', availabilityTypes: ['custom'] }), [
    '/voyages/brouillon',
    '/voyages/brouillon/lp',
  ])
})

test('voyage supprimé (sans slug) : seuls les listings', () => {
  assert.deepEqual(voyagePaths({ _id: 'id' }), ['/voyages', '/prochains-departs', '/'])
})

test('page_partenariat revalide la landing du portage', () => {
  assert.deepEqual(REVALIDATION_REGISTRY.page_partenariat.paths({}), ['/portage'])
})
