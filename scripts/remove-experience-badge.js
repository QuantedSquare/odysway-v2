import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to voyages directory
const voyagesDir = path.join(__dirname, '../content/voyages')

// Function to recursively find all JSON files
function findJsonFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath))
    }
    else if (item.endsWith('.json')) {
      files.push(fullPath)
    }
  }

  return files
}

// Function to remove experienceBadge from a JSON file
function removeExperienceBadge(filePath) {
  try {
    // Read the JSON file
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)

    // Check if experienceBadge exists
    if (data.badgeSection.experienceBadge !== undefined) {
      // Remove experienceBadge
      delete data.badgeSection.experienceBadge

      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log(`✅ Removed experienceBadge from: ${path.relative(process.cwd(), filePath)}`)
      return true
    }
    else {
      console.log(`⏭️  No experienceBadge found in: ${path.relative(process.cwd(), filePath)}`)
      return false
    }
  }
  catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return false
  }
}

// Main execution
function main() {
  console.log('🔍 Scanning for JSON files in voyages directory...')

  try {
    const jsonFiles = findJsonFiles(voyagesDir)
    console.log(`📁 Found ${jsonFiles.length} JSON files`)

    let processed = 0
    let modified = 0

    for (const file of jsonFiles) {
      processed++
      const wasModified = removeExperienceBadge(file)
      if (wasModified) modified++
    }

    console.log('\n📊 Summary:')
    console.log(`   Files processed: ${processed}`)
    console.log(`   Files modified: ${modified}`)
    console.log(`   Files unchanged: ${processed - modified}`)
  }
  catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
