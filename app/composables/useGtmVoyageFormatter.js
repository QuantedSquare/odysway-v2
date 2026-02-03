/**
 * GTM Voyage Formatter Composable
 * Formats voyage data for GTM ecommerce tracking
 */

export const useGtmVoyageFormatter = () => {
  /**
   * Format a single voyage for GTM tracking
   * @param {Object} voyage - Voyage object from Sanity
   * @param {Object} options - Additional options
   * @param {number} options.discount - Discount amount if any
   * @returns {Object} Formatted item object for GTM
   */
  const formatVoyageForGtm = (voyage, options = {}) => {
    const { discount = 0 } = options

    // Debug: Log voyage data to see what we're receiving
    if (import.meta.client && import.meta.dev) {
      // console.log('🔍 GTM Formatter - Voyage data:', {
      //   title: voyage.title,
      //   destinations: voyage.destinations,
      //   experienceType: voyage.experienceType,
      //   categories: voyage.categories,
      //   monthlyAvailability: voyage.monthlyAvailability,
      //   availabilityTypes: voyage.availabilityTypes,
      // })
    }

    // Get base price from pricing object
    const basePrice = voyage.pricing?.startingPrice || voyage.pricing?.pricePerPerson || 0

    // Determine voyage type (Groupe/Individuel)
    const voyageType = voyage.availabilityTypes?.includes('groupe') ? 'Groupe' : 'Individuel'

    // Get periods from monthlyAvailability (all months as comma-separated string)
    // Map month codes to French names
    const monthMap = {
      janvier: 'Janvier',
      fevrier: 'Février',
      mars: 'Mars',
      avril: 'Avril',
      mai: 'Mai',
      juin: 'Juin',
      juillet: 'Juillet',
      aout: 'Août',
      septembre: 'Septembre',
      octobre: 'Octobre',
      novembre: 'Novembre',
      decembre: 'Décembre',
      toutePeriodes: 'Toute période',
    }
    const period = voyage.monthlyAvailability && voyage.monthlyAvailability.length > 0
      ? voyage.monthlyAvailability
          .map(month => monthMap[month] || month)
          .join(', ')
      : null

    // Get experience from experienceType reference
    const experience = voyage.experienceType?.title || null

    // Get thematics (all categories as comma-separated string)
    const thematic = voyage.categories && voyage.categories.length > 0
      ? voyage.categories.map(cat => cat?.title).filter(Boolean).join(', ')
      : null

    // Get destinations (all destinations as comma-separated string)
    const destination = voyage.destinations && voyage.destinations.length > 0
      ? voyage.destinations.map(dest => dest?.title).filter(Boolean).join(', ')
      : null

    // Handle slug - could be string (aliased in GROQ) or object with current property
    const slugValue = typeof voyage.slug === 'string'
      ? voyage.slug
      : voyage.slug?.current || voyage.slug

    const formattedItem = {
      itemId: slugValue || voyage._id,
      itemName: voyage.title,
      itemCategory: destination,
      itemCategory2: voyageType,
      itemCategory3: period,
      itemCategory4: experience,
      itemCategory5: thematic,
      price: basePrice,
      discount,
      quantity: 1,
    }

    // Debug: Log formatted result
    if (import.meta.client && import.meta.dev) {
      // console.log('✅ GTM Formatter - Formatted item:', formattedItem)
    }

    return formattedItem
  }

  /**
   * Format multiple voyages for GTM tracking
   * @param {Array} voyages - Array of voyage objects
   * @param {Object} options - Additional options
   * @returns {Array} Array of formatted item objects
   */
  const formatVoyagesForGtm = (voyages, options = {}) => {
    if (!Array.isArray(voyages)) return []

    return voyages.map(voyage => formatVoyageForGtm(voyage, options))
  }

  /**
   * Extract item list name from section title or context
   * @param {string} sectionTitle - Title of the section
   * @returns {string} Formatted item list name
   */
  const getItemListName = (sectionTitle) => {
    return sectionTitle || 'Liste de voyages'
  }

  return {
    formatVoyageForGtm,
    formatVoyagesForGtm,
    getItemListName,
  }
}
