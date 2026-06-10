import { getDateStatus } from '~/utils/getDateStatus'

// Month number (1-12) -> Sanity monthlyAvailability key
const MONTH_KEYS = [
  '', // 0 unused
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
]

// Resolve a list of destination param slugs (which may be destination slugs,
// region slugs or the `top-destination` pseudo-slug) into the set of
// destination titles they cover.
function resolveDestinationTitles(destSlugs, { destinations = [], regions = [] }) {
  const titles = new Set()
  destSlugs.forEach((slug) => {
    if (slug === 'top-destination') {
      destinations.filter(d => d.isTopDestination).forEach(d => titles.add(d.title))
      return
    }
    const region = regions.find(r => r.slug === slug)
    if (region) {
      destinations
        .filter(d => d.regions?.some(r => r.nom === region.nom))
        .forEach(d => titles.add(d.title))
      return
    }
    const dest = destinations.find(d => d.slug === slug)
    if (dest) titles.add(dest.title)
  })
  return titles
}

export function useVoyageFilters() {
  function filterByDestinations(voyages, destSlugs, ctx = {}) {
    if (!destSlugs || destSlugs.length === 0) return voyages
    const titles = resolveDestinationTitles(destSlugs, ctx)
    if (titles.size === 0) return voyages
    return voyages.filter(v => v.destinations?.some(d => titles.has(d.title)))
  }

  function filterByType(voyages, travelTypeLabel, travelTypes = {}) {
    if (!travelTypeLabel) return voyages
    const typeFilters = {
      [travelTypes.group]: v => v.availabilityTypes?.includes('groupe'),
      [travelTypes.individual]: v => v.availabilityTypes?.includes('privatisation'),
    }
    const fn = typeFilters[travelTypeLabel]
    return fn ? voyages.filter(fn) : voyages
  }

  function filterByDate(voyages, fromList) {
    if (!fromList) return voyages
    const monthNumbers = fromList.split(',').map(Number).filter(n => n > 0 && n <= 12)
    if (monthNumbers.length === 0) return voyages
    const selectedKeys = monthNumbers.map(n => MONTH_KEYS[n])

    return voyages.filter((v) => {
      const avail = v.monthlyAvailability
      if (!Array.isArray(avail)) return false
      const cleaned = avail.map(m => m.replace(/[\u200B-\u200F\uFEFF]/g, ''))
      return selectedKeys.some(key => cleaned.includes(key))
    })
  }

  function filterByCategories(voyages, categorySlugs) {
    if (!categorySlugs || categorySlugs.length === 0) return voyages
    return voyages.filter(v => v.categories?.some(c => categorySlugs.includes(c.slug)))
  }

  function filterByConfirmed(voyages, confirmedFilter, travelsWithDates) {
    if (!confirmedFilter) return voyages
    if (!Array.isArray(travelsWithDates) || travelsWithDates.length === 0) return voyages

    const confirmedSlugs = new Set()
    travelsWithDates.forEach((travel) => {
      if (!Array.isArray(travel.dates)) return
      const hasConfirmed = travel.dates.some(date => getDateStatus(date)?.status === 'confirmed')
      if (hasConfirmed) confirmedSlugs.add(travel.slug)
    })
    return voyages.filter(v => confirmedSlugs.has(v.slug))
  }

  // Compose every filter from a normalized filter object.
  // filters: { destinations: string[], travelType: string, from: string,
  //            activities: string[], confirmed: boolean }
  function applyFilters(voyages, filters = {}, ctx = {}) {
    let list = voyages || []
    list = filterByDestinations(list, filters.destinations, ctx)
    list = filterByType(list, filters.travelType, ctx.travelTypes)
    list = filterByDate(list, filters.from)
    list = filterByCategories(list, filters.activities)
    list = filterByConfirmed(list, filters.confirmed, ctx.travelsByDate)
    return list
  }

  function countMatching(voyages, filters = {}, ctx = {}) {
    return applyFilters(voyages, filters, ctx).length
  }

  return {
    filterByDestinations,
    filterByType,
    filterByDate,
    filterByCategories,
    filterByConfirmed,
    applyFilters,
    countMatching,
  }
}
