import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const categoriesDir = path.join(__dirname, '../content/categories')

function getCategoryData() {
  const categories = []

  // Read all subdirectories in categoriesDir
  const subdirs = fs.readdirSync(categoriesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  subdirs.forEach((subdir) => {
    const subdirPath = path.join(categoriesDir, subdir)
    // Find the first .json file in the subdir
    const files = fs.readdirSync(subdirPath)
    const jsonFile = files.find(f => f.endsWith('.json'))
    if (jsonFile) {
      const jsonPath = path.join(subdirPath, jsonFile)
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      // Extract name and slug (fallback to subdir name if slug missing)
      categories.push({
        name: data.name || subdir,
        slug: data.slug || subdir,
      })
    }
  })

  return categories
}

// Run and print result
function updateVoyagesCategs() {
  const categories = getCategoryData()

  const voyagesDir = path.join(__dirname, '../content/voyages')
  const voyagesFiles = fs.readdirSync(voyagesDir)

  voyagesFiles.forEach((voyageFile) => {
    const voyagePath = path.join(voyagesDir, voyageFile)
    const voyageData = JSON.parse(fs.readFileSync(voyagePath, 'utf-8'))

    if (voyageData.categories && voyageData.categories.length > 0) {
      // Create a new categories array with possible updates
      const updatedCategories = voyageData.categories.map((category) => {
        const isSlug = categories.some(c => c.slug === category.name)
        if (!isSlug) {
          const newCategory = categories.find(c => c.name === category.name)
          return {
            name: newCategory ? newCategory.slug : 'ou-partir-en-ete',
          }
        }
        return category
      })

      // Only write if categories actually changed
      const categoriesChanged = JSON.stringify(updatedCategories) !== JSON.stringify(voyageData.categories)
      if (categoriesChanged) {
        voyageData.categories = updatedCategories
        fs.writeFileSync(voyagePath, JSON.stringify(voyageData, null, 2))
        console.log(`Updated: ${voyageFile}`)
      }
    }
  })
}

updateVoyagesCategs()
