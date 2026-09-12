#!/usr/bin/env node
/**
 * Fails if a Sanity document type is not classified in the revalidation registry.
 *
 * This is the guard against the failure that started all this: `siteBanner` existed
 * in the CMS for months while the webhook had no branch for it, so publishing it
 * revalidated exactly nothing and the change surfaced a day later. The registry now
 * falls back to a full sweep for unknown types, but an unclassified type is still a
 * bug — a sweep of ~480 paths where a handful would do.
 *
 *   node scripts/check-revalidation-coverage.mjs
 */
import { readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const SCHEMA_DIR = 'cms/schemaTypes'
const REGISTRY_FILE = 'server/utils/revalidationRegistry.ts'

// Only types actually registered in the Studio schema count.
const index = readFileSync(join(SCHEMA_DIR, 'index.ts'), 'utf8')
const schemaList = index.split('export const schemaTypes')[1] || ''
const imports = [...index.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*'\.\/([\w/]+)'/g)]
  .map(([, symbol, path]) => ({ symbol, file: `${path}.ts` }))
  .filter(({ symbol }) => new RegExp(`^\\s*${symbol},?\\s*$`, 'm').test(schemaList))

const documentTypes = new Set()
for (const { symbol, file } of imports) {
  const full = join(SCHEMA_DIR, file)
  let source
  try {
    source = readFileSync(full, 'utf8')
  }
  catch {
    console.warn(`! ${file} listed in index.ts but not found`)
    continue
  }
  // Anchor on the exported symbol: several files declare nested objects with
  // defineType() before their own document type.
  const at = source.indexOf(`export const ${symbol} = defineType({`)
  if (at === -1) {
    console.warn(`! ${symbol} not found in ${basename(full)}`)
    continue
  }
  const head = source.slice(at, source.indexOf('fields:', at))
  const name = head.match(/name:\s*'([^']+)'/)?.[1]
  const kind = head.match(/type:\s*'(document|object)'/)?.[1]
  // homePageType omits an explicit `type`, which defaults to document.
  if (name && kind !== 'object') documentTypes.add(name)
  if (!name) console.warn(`! could not read a type name from ${basename(full)}`)
}

const registry = readFileSync(REGISTRY_FILE, 'utf8')
const body = registry.slice(registry.indexOf('REVALIDATION_REGISTRY: Record<string, RevalidationScope> = {'))
const classified = new Set([...body.matchAll(/^ {2}(\w+):\s*\{/gm)].map(([, key]) => key))

const missing = [...documentTypes].filter(type => !classified.has(type)).sort()
const extra = [...classified].filter(type => !documentTypes.has(type)).sort()

console.log(`${documentTypes.size} document types in ${SCHEMA_DIR}, ${classified.size} classified in ${REGISTRY_FILE}`)
if (extra.length) console.warn(`\n⚠️  classified but no longer in the schema:\n  ${extra.join('\n  ')}`)
if (missing.length) {
  console.error(`\n❌ missing from REVALIDATION_REGISTRY (they would each trigger a full sweep):\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
console.log('\n✅ every document type is classified')
