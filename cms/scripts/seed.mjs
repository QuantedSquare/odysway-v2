/* eslint-env node */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import process from 'node:process'
import {log, error} from 'node:console'
import migrateRegions from './migrateContinents.js'
import migrateTops from './migrateTops.js'
import migrateDestinations from './migrateDestinations.js'
import migrateCategories from './migrateCategories.js'
import migrateExperiences from './migrateExperiences.js'
import migrateTeam from './migrateTeam.js'
import migrateFooter from './migrateFooter.js'
import migrateHeader from './migrateHeader.js'
import migrateCheckoutPage from './migrateCheckoutPage.js'
import migrateContactPage from './migrateContactPage.js'
import migrateCtas from './migrateCtas.js'
import migrateDevisPage from './migrateDevisPage.js'
import migrateExperiencesPage from './migrateExperiencesPage.js'
import migrateVoyages from './migrateVoyages.js'
import migrateReviews from './migrateReviews.js'
import migrateBlogs from './migrateBlogs.js'
import linkBlogsToCategories from './linkBlogsToCategories.js'
import linkBlogsToDestinations from './linkBlogsToDestinations.js'
import migratePolitiqueConfidentialite from './migratePolitiqueConfidentialite.js'
dotenv.config()

const projectId = process.env.SANITY_PROJECT_ID || 'nu6yntji'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN 
if (!token) {
  error(
    'Missing SANITY_WRITE_TOKEN environment variable. Create a token with write access in the Sanity project settings and set it before running the seed.',
  )
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

  // log('🔄 Migrating destinations from JSON files...')
  // await migrateDestinations(client)

  // log('🔄 Migrating experiences from JSON files...')
  // await migrateExperiences(client)

  // log('🔄 Migrating team members from JSON files...')
  // await migrateTeam(client)

  // log('🔄 Migrating footer configuration...')
  // await migrateFooter(client)

  // log('🔄 Migrating header configuration...')
  // await migrateHeader(client)

  // log('🔄 Migrating destinations from JSON files...')
  // await migrateDestinations(client)

  // log('🔄 Migrating categories from JSON files...')
  // await migrateCategories(client)

  // log('🔄 Migrating checkout page configuration...')
  // await migrateCheckoutPage(client)

  // log('🔄 Migrating contact page configuration...')
  // await migrateContactPage(client)

  // log('🔄 Migrating CTAs configuration...')
  // await migrateCtas(client)

  // log('🔄 Migrating devis page configuration...')
  // await migrateDevisPage(client)

  // log('🔄 Migrating experiences page configuration...')
  // await migrateExperiencesPage(client)

  // log('🔄 Migrating voyages...')
  // await migrateVoyages(client)

  // log('🔄 Migrating reviews...')
  // await migrateReviews(client)

  log('🔄 Migrating politique de confidentialité...')
  await migratePolitiqueConfidentialite(client)

  // log('🔄 Migrating categories from JSON files...')
  // await migrateCategories(client)

  // log('🔄 Migrating blogs from MD files...')
  // await migrateBlogs(client)

  // log('🔄 Linking blogs to categories...')
  // await linkBlogsToCategories(client)

  // log('🔄 Linking blogs to destinations...')
  // await linkBlogsToDestinations(client)

  log('Seed completed')
}

run().catch((e) => {
  error(e)
  process.exit(1)
})
