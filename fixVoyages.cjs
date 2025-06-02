const fs = require('fs')
const path = require('path')

const voyagesDir = path.join(__dirname, 'content/voyages')

// Replace with a real value from your experienceChoices array
const DEFAULT_EXPERIENCE_TYPE = '' // <-- CHANGE THIS
const DEFAULT_BADGE_EXPERIENCE_TEXT = '' // <-- CHANGE THIS

fs.readdirSync(voyagesDir).forEach((file) => {
  if (!file.endsWith('.json')) return

  const filePath = path.join(voyagesDir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let changed = false

  // 1. Add customAvailable if missing
  if (typeof data.customAvailable !== 'boolean') {
    data.customAvailable = false
    changed = true
  }

  // 2. Fix experienceType
  if (!data.experienceType || typeof data.experienceType !== 'string' || data.experienceType.trim() === '') {
    data.experienceType = DEFAULT_EXPERIENCE_TYPE
    changed = true
  }

  // 3. Fix badgeSection.experienceBadge.text
  if (
    data.badgeSection
    && data.badgeSection.experienceBadge
    && data.badgeSection.experienceBadge.text !== DEFAULT_BADGE_EXPERIENCE_TEXT
  ) {
    data.badgeSection.experienceBadge.text = DEFAULT_BADGE_EXPERIENCE_TEXT
    changed = true
  }

  // 4. Fix pricing.indivRoomPrice
  if (
    data.pricing
    && (typeof data.pricing.indivRoomPrice !== 'number' || isNaN(data.pricing.indivRoomPrice))
  ) {
    data.pricing.indivRoomPrice = 0
    changed = true
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`Fixed: ${file}`, data)
  }
})
