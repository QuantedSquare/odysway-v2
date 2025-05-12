const fs = require('fs')
const path = require('path')
const slugify = require('slugify')

// Load pays.json
const dataPath = path.join(__dirname, 'pays.json')
const pays = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

// Define allowed regions
const ALLOWED_REGIONS = new Set([
  'Europe', 'Afrique', 'Asie', 'Amérique du Sud', 'Amérique du Nord', 'Amérique Centrale', 'Moyen-Orient', 'France',
])

function getRegionsForDestination(p) {
  const regions = new Set();
  (p.destinations || []).forEach((dest) => {
    const nom = dest.nom
    if (ALLOWED_REGIONS.has(nom)) {
      regions.add(nom)
    }
  })
  if (regions.has('France')) {
    regions.add('Europe')
  }
  return Array.from(regions).sort()
}

// Use the same logic as generateImageFilename from migration-pays.js
function generateImageFilename(imageUrl, fallbackSlug) {
  if (!imageUrl) return `${fallbackSlug}.jpg`
  try {
    const urlObj = new URL(imageUrl)
    const originalFilename = path.basename(urlObj.pathname)
    const extension = path.extname(originalFilename)
    if (extension.length === 0) {
      return `${originalFilename}.jpg`
    }
    return originalFilename
  }
  catch {
    // If imageUrl is not a valid URL, fallback
    return `${fallbackSlug}.jpg`
  }
}

// 1. Build region.json
const regionSet = new Set()
pays.forEach((p) => {
  (p.destinations || []).forEach((dest) => {
    const nom = dest.nom
    if (ALLOWED_REGIONS.has(nom)) {
      regionSet.add(nom)
    }
  })
})
regionSet.add('France')
const regionList = Array.from(regionSet).sort().map(r => ({ nom: r }))
fs.writeFileSync(path.join(__dirname, 'region.json'), JSON.stringify(regionList, null, 2), 'utf-8')

// 2. Build per-destination JSON files
const outputDir = path.join(__dirname, 'destinations')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

pays.forEach((p) => {
  const nom = p.nom
  const slug = slugify(nom, { lower: true })
  const imageFilename = generateImageFilename(p.image, slug)
  const obj = {
    nom: nom,
    chapkaZone: p.zone_chapka,
    iso: p.iso,
    interjection: p.interjection,
    meta_description: p.meta_description,
    content_slug: p.content_slug,
    regions: getRegionsForDestination(p),
    image: {
      src: `/images/destinations/${imageFilename}`,
      alt: `Image de la destination "${nom}"`,
    },
  }
  fs.writeFileSync(path.join(outputDir, `${slug}.json`), JSON.stringify(obj, null, 2), 'utf-8')
})

console.log('Done! Wrote region.json and per-destination JSON files.')
