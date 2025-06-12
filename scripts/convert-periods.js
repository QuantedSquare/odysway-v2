import fs from 'fs'
import path from 'path'

const MONTHS_MAP = [
  { key: 'janvier', fr: 'Janvier' },
  { key: 'fevrier', fr: 'Février' },
  { key: 'mars', fr: 'Mars' },
  { key: 'avril', fr: 'Avril' },
  { key: 'mai', fr: 'Mai' },
  { key: 'juin', fr: 'Juin' },
  { key: 'juillet', fr: 'Juillet' },
  { key: 'aout', fr: 'Août' },
  { key: 'septembre', fr: 'Septembre' },
  { key: 'octobre', fr: 'Octobre' },
  { key: 'novembre', fr: 'Novembre' },
  { key: 'decembre', fr: 'Décembre' },
]

function monthsArrayToObject(arr) {
  if (!Array.isArray(arr)) return null
  // If all months are present, set toutePeriodes to true
  const months = arr.map(m => m.month && m.month.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  const allMonths = MONTHS_MAP.every(m => months.includes(m.fr.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
  const obj = {
    toutePeriodes: allMonths,
  }
  for (const { key, fr } of MONTHS_MAP) {
    obj[key] = months.includes(fr.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  }
  return obj
}

const DIR = path.resolve('../content/voyages')
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'))

for (const file of files) {
  const filePath = path.join(DIR, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let changed = false

  if (Array.isArray(data.idealPeriods)) {
    const obj = monthsArrayToObject(data.idealPeriods)
    if (obj) {
      data.idealPeriods = obj
      changed = true
    }
  }
  if (Array.isArray(data.monthlyAvailability)) {
    const obj = monthsArrayToObject(data.monthlyAvailability)
    if (obj) {
      data.monthlyAvailability = obj
      changed = true
    }
  }

  if (changed) {
    console.log('data', data)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`Updated ${file}`)
  }
}
