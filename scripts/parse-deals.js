import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dealsDir = path.join(__dirname, '../content/deals')
const datesDir = path.join(__dirname, '../content/dates')

function safeParseInt(val) {
  if (typeof val === 'number') return val
  const parsed = parseInt(val, 10)
  return isNaN(parsed) ? 0 : parsed
}

function processDealFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const deal = JSON.parse(raw)
  const slug = deal.slug
  const dates = deal.dates || []
  if (!slug) return

  const travelDir = path.join(datesDir, slug)
  if (!fs.existsSync(travelDir)) fs.mkdirSync(travelDir, { recursive: true })

  dates.forEach((dateObj) => {
    const departureDate = (dateObj.departureDate || '').split('T')[0]
    if (!departureDate) return

    const dateFile = path.join(travelDir, `${departureDate}.json`)
    const dateData = {
      published: false,
      slug,
      badges: [],
      departureDate: dateObj.departureDate,
      returnDate: dateObj.returnDate,
      startingPrice: safeParseInt(dateObj.startingPrice),
      maxTravelers: safeParseInt(dateObj.maxTravellers),
      bookedTravelers: safeParseInt(dateObj.bookedPlaces),
      includeFlight: safeParseInt(dateObj.flyTicketPrice) > 0,
      flightPrice: safeParseInt(dateObj.flyTicketPrice),
    }
    fs.writeFileSync(dateFile, JSON.stringify(dateData, null, 2), 'utf-8')
    console.log(`Created: ${dateFile}`)
  })
}

function main() {
  if (!fs.existsSync(datesDir)) fs.mkdirSync(datesDir, { recursive: true })
  const files = fs.readdirSync(dealsDir).filter(f => f.endsWith('.json'))
  files.forEach((file) => {
    processDealFile(path.join(dealsDir, file))
  })
  console.log('Done!')
}

main()
