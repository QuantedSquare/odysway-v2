/* eslint-env node */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import process from 'node:process'
import {log, error} from 'node:console'
import migrateRegions from './migrateContinents.js'
import migrateTops from './migrateTops.js'
import migrateDestinations from './migrateDestinations.js'
import migrateCategories from './migrateCategories.js'
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

  log('🔄 Migrating tops from JSON files...')
  await migrateTops(client)

  log('🔄 Migrating regions from JSON files...')
  await migrateRegions(client)

  log('🔄 Migrating destinations from JSON files...')
  await migrateDestinations(client)
  

  log('🔄 Migrating categories from JSON files...')
  await migrateCategories(client)

  log('🔄 Creating demo data...')
  const tx = client.transaction() 

  const userId = 'demoUser'
  tx.createOrReplace({
    _id: userId,
    _type: 'user',
    name: 'Jane Doe',
    username: 'jane',
    email: 'jane@example.com',
  })

  const catAdventureId = 'catAdventure'
  // tx.createOrReplace({_id: catAdventureId, _type: 'category', title: 'Aventure', slug: {current: 'aventure'}})

  // const regionId = 'regionEurope'
  //tx.createOrReplace({_id: regionId, _type: 'region', nom: 'Europe', slug: {current: 'europe'}})

  const destId = 'destIceland'
  // tx.createOrReplace({_id: destId, _type: 'destination', title: 'Islande', slug: {current: 'islande'}, regions: [{_type: 'reference', _ref: regionId}]})

  const expId = 'expTrek'
  tx.createOrReplace({_id: expId, _type: 'experience', title: 'Trek', slug: {current: 'trek'}})

  const teamId = 'teamAlex'
  tx.createOrReplace({_id: teamId, _type: 'teamMember', name: 'Alex', slug: {current: 'alex'}, position: 'Expert voyage'})

  const post1Id = 'postDemo1'
  tx.createOrReplace({
    _id: post1Id,
    _type: 'post',
    title: 'Bienvenue en Islande',
    slug: {current: 'bienvenue-islande'},
    author: {_type: 'reference', _ref: userId},
    publishedAt: new Date().toISOString(),
    body: [{_type: 'block', children: [{_type: 'span', text: 'Post de demo'}]}],
  })

  const voyageId = 'voyageIceland'
  tx.createOrReplace({
    _id: voyageId,
    _type: 'voyage',
    published: true,
    title: 'Islande Aventure',
    slug: {current: 'islande-aventure'},
    destinations: [{_type: 'reference', _ref: destId}],
    experienceType: {_type: 'reference', _ref: expId},
    categories: [{_type: 'reference', _ref: catAdventureId}],
    duration: 8,
    nights: 7,
    includeFlight: false,
    authorNote: {text: 'Une aventure inoubliable', author: {_type: 'reference', _ref: teamId}},
    experiencesBlock: ['Découverte des glaciers', 'Baignade dans les sources chaudes'],
  })

  const reviewId = 'review1'
  tx.createOrReplace({
    _id: reviewId,
    _type: 'review',
    author: 'Marc',
    rating: 5,
    date: new Date().toISOString().slice(0, 10),
    text: 'Voyage exceptionnel !',
    voyage: {_type: 'reference', _ref: voyageId},
    isOnHome: true,
  })

  await tx.commit()
  log('Seed completed')
}

run().catch((e) => {
  error(e)
  process.exit(1)
})

