/* eslint-env node */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import process from 'node:process'
import {log, error} from 'node:console'
import migrateRegions from './migrateContinents.js'
import migrateTops from './migrateTops.js'
import migrateDestinations from './migrateDestinations.js'
dotenv.config()

const projectId = process.env.SANITY_PROJECT_ID || 'nu6yntji'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  error('Missing SANITY_WRITE_TOKEN environment variable. Create a token with write access in the Sanity project settings and set it before running the seed.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-19',
  token,
  useCdn: false,
})
log('client', client)

async function run() {

  // log('🔄 Migrating tops from JSON files...')
  // await migrateTops(client)

  // log('🔄 Migrating regions from JSON files...')
  // await migrateRegions(client)

  log('🔄 Migrating destinations from JSON files...')
  await migrateDestinations(client)
  
  log('Seed completed')
}

run().catch((e) => {
  error(e)
  process.exit(1)
})

