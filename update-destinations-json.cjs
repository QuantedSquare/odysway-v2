const fs = require('fs')
const path = require('path')

const baseDir = path.join(__dirname, 'content', 'destinations')

fs.readdirSync(baseDir).forEach((dir) => {
  const dirPath = path.join(baseDir, dir)
  if (fs.statSync(dirPath).isDirectory()) {
    // Find the json file in the directory
    const files = fs.readdirSync(dirPath)
    const jsonFile = files.find(f => f.endsWith('.json'))
    if (jsonFile) {
      const jsonPath = path.join(dirPath, jsonFile)
      let data
      try {
        data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      }
      catch (e) {
        console.error('Error reading or parsing', jsonPath, e)
        return
      }
      // Convert chapka to string if it's a number
      if (typeof data.chapka === 'number') {
        data.chapka = String(data.chapka)
      }
      // Convert regions array to array of objects
      if (Array.isArray(data.regions)) {
        data.regions = data.regions.map((region) => {
          if (typeof region === 'string') {
            return { nom: region }
          }
          else if (region && typeof region === 'object' && region.nom) {
            return region
          }
          return { nom: String(region) }
        })
      }
      // Write back to file
      try {
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
        console.log('Updated', data)
      }
      catch (e) {
        console.error('Error writing', jsonPath, e)
      }
    }
  }
})
