/* Populate imageCard from image for all voyages that don't have one yet */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config()


const projectId = process.env.SANITY_PROJECT_ID || 'nu6yntji'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-19',
  token,
  useCdn: false,
})
console.log('client', client)




async function populateImageCard() {
  const voyages = await client.fetch(
    `*[_type == "voyage" && !defined(imageCard)]{ _id, title, image }`
  )

  console.log(`Found ${voyages.length} voyages without imageCard\n`)

  if (voyages.length === 0) {
    console.log('Nothing to do.')
    return
  }

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const voyage of voyages) {
    if (!voyage.image?.asset?._ref) {
      console.log(`  ⚠️  Skipping "${voyage.title}" — no image to copy`)
      skipped++
      continue
    }

    try {
      await client.patch(voyage._id).set({ imageCard: voyage.image }).commit()
      console.log(`  ✅ "${voyage.title}"`)
      updated++
    } catch (err) {
      console.error(`  ❌ Failed for "${voyage.title}" (${voyage._id}): ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone — ${updated} updated, ${skipped} skipped (no image), ${failed} failed`)
}

populateImageCard().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
