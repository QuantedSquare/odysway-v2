import {createClient} from '@sanity/client'
import {log, error} from 'node:console'
import dotenv from 'dotenv'
import process from 'node:process'
import fs from 'node:fs'
dotenv.config()




const retrieveAllReferenceFromAnImage = `*[_type == "sanity.imageAsset"]{
  _id,
  originalFilename,
  url,
  "usedIn": *[references(^._id)]{
    _type,
    _id,
    title,
    name,
    // If the referencing document is a voyage, also fetch destination names
    _type == "voyage" => {
      destinations[]->{
        title,
        slug,
        "region": regions[]->{
          "title": nom,
          "slug": slug.current,
        },
      }
    }
  }
}`;


function slugify(input) {
  if (!input || typeof input !== 'string') return ''
  // Normalize and remove accents
  const withoutAccents = input.normalize('NFD').replace(/\p{Diacritic}+/gu, '')
  // Replace non-alphanumeric with hyphen, collapse repeats, trim hyphens
  const hyphenated = withoutAccents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return hyphenated
}

function getExtensionFromUrlOrFilename({url, originalFilename}) {
  const fromOriginal = (originalFilename || '').split('.').pop()
  const fromUrl = (url || '').split('?')[0].split('#')[0].split('.').pop()
  const candidate = (fromOriginal || fromUrl || '').toLowerCase()
  // Guard common cases
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(candidate)) return candidate
  return 'jpg'
}

function uniqueJoin(parts, delimiter = '-') {
  const seen = new Set()
  const result = []
  for (const part of parts) {
    const s = slugify(part)
    if (s && !seen.has(s)) {
      seen.add(s)
      result.push(s)
    }
  }
  return result.join(delimiter)
}

function computeFilenameForImage(image) {
  const {usedIn = []} = image
  const voyages = usedIn.filter(x => x && x._type === 'voyage')
  const voyageTitles = voyages.map(v => v.title).filter(Boolean)
  const destinationTitles = []
  const regionTitles = []
  for (const v of voyages) {
    const dests = (v.destinations || []).map(d => d && d.title).filter(Boolean)
    destinationTitles.push(...dests)
    for (const d of (v.destinations || [])) {
      const regions = (d && d.region) || []
      for (const r of regions) {
        if (r && r.title) regionTitles.push(r.title)
      }
    }
  }

  let base = ''
  if (voyages.length > 0 && (destinationTitles.length > 0 || regionTitles.length > 0)) {
    // Order: regions -> destinations -> voyages, while de-duplicating across all parts
    const combined = [...regionTitles, ...destinationTitles, ...voyageTitles]
    base = uniqueJoin(combined, '-')
  } else if (voyages.length > 0) {
    base = uniqueJoin(voyageTitles, '-')
  } else if (usedIn.length > 0) {
    // Fallbacks for non-voyage usages (e.g., blog, entreprise, static pages)
    const titles = usedIn.map(x => x && (x.title || x.name)).filter(Boolean)
    if (titles.length > 0) {
      base = uniqueJoin(titles, '-')
    } else {
      const first = usedIn[0]
      base = slugify(`${first && first._type ? first._type : 'asset'}-${first && first._id ? first._id : image._id}`)
    }
  } else {
    // No usages at all
    base = slugify(image._id || 'asset')
  }

  // Limit length to keep filenames manageable
  if (base.length > 140) base = base.slice(0, 140).replace(/-+$/g, '')
  const ext = getExtensionFromUrlOrFilename(image)
  return `${base || 'asset'}.${ext}`
}

export default async function renameImgBasedOnRef() {
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'nu6yntji',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2025-02-19',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })
  const DRY_RUN = (process.env.DRY_RUN || 'true').toLowerCase() === 'false'

  const images = await client.fetch(retrieveAllReferenceFromAnImage)

  // Always refresh the local snapshot for inspection
  fs.writeFileSync('images.json', JSON.stringify(images, null, 2))

  // Build mutations array for all images that need renaming
  const mutations = images
    .map((image) => {
      const desired = computeFilenameForImage(image)
      const current = image.originalFilename || ''
      if (!desired || desired === current) {
        return null
      }

      log(`Rename: ${image._id}`)
      log(`  from: ${current}`)
      log(`    to: ${desired}`)

      return {
        patch: {
          id: image._id,
          set: {
            originalFilename: desired,
          },
        },
      }
    })
    .filter(Boolean)

  const renameCount = mutations.length
  const skipCount = images.length - renameCount

  if (mutations.length > 0) {
    log(`\n✓ Prepared ${mutations.length} mutation(s) to apply`)
    
    if (!DRY_RUN) {
      try {
        const result = await client.mutate(mutations)
        log(`✓ Mutations applied successfully:`, result)
      } catch (err) {
        error('❌ Error applying mutations:', err)
        throw err
      }
    } else {
      log(`⚠️  DRY RUN: Mutations not applied (set DRY_RUN=false to apply)`)
    }
  }

  log(`\nDone. Renamed: ${renameCount}, Skipped: ${skipCount}, Dry run: ${DRY_RUN}`)
}

renameImgBasedOnRef().catch(err => {
  error('❌ Error:', err.message)
  process.exit(1)
})