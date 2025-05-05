import fs from 'fs'
import path from 'path'

// Read all travel slugs at build time
const travelsDir = path.resolve(__dirname, 'content/travels')
const travelFiles = fs.readdirSync(travelsDir)
const travelChoices = travelFiles
  .map(file => require(path.join(travelsDir, file)).slug)
  .filter(Boolean) as [string, ...string[]]

z.object({
  travelChoice: z.enum(travelChoices).optional(),
})
