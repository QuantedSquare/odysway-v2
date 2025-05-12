const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'content/destinations')
const exclude = ['regions.json']

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !exclude.includes(f))

files.forEach((file) => {
  const filePath = path.join(dir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  // Remap keys
  const newData = {
    titre: data.nom || '',
    slug: data.content_slug || '',
    chapka: String(data.chapkaZone ?? ''),
    iso: data.iso || '',
    interjection: data.interjection || '',
    metaDescription: data.meta_description || '',
    visible: typeof data.visible === 'boolean' ? data.visible : true,
    regions: Array.isArray(data.regions)
      ? data.regions.map(region => ({ nom: region }))
      : [],
    image: data.image || { src: '', alt: '' },
  }

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8')
  console.log(`Migrated: ${file}`)
})

console.log('Migration complete.')
