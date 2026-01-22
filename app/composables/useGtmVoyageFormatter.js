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

    // Get base price from pricing object
    const basePrice = voyage.pricing?.pricePerPerson || 0

    // Determine voyage type (Groupe/Individuel)
    const voyageType = voyage.availabilityTypes?.includes('group') ? 'Groupe' : 'Individuel'

    // Get period from dates (if available) or default to null
    const period = voyage.period || null

    // Get experience from voyage data
    const experience = voyage.experience?.title || null

    // Get thematic
    const thematic = voyage.thematic?.title || null

    // Get destination
    const destination = voyage.destination?.title || null

    return {
      itemId: voyage._id || voyage.slug?.current || voyage.slug,
      itemName: voyage.title,
      itemCategory: destination,
      itemCategory2: voyageType,
      itemCategory3: period,
      itemCategory4: experience,
      itemCategory5: thematic,
      price: basePrice,
      discount,
    }
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
