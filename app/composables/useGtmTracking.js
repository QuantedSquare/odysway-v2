/**
 * GTM DataLayer Tracking Composable
 * Manages all Google Tag Manager dataLayer push events
 */

import { stegaClean } from '@sanity/client/stega'

export const useGtmTracking = () => {
  /**
   * Clean Sanity Stega encoding from strings
   * Recursively cleans all string values in an object
   * @param {*} value - Value to clean
   * @returns {*} Cleaned value
   */
  const cleanStegaData = (value) => {
    if (typeof value === 'string') {
      return stegaClean(value)
    }
    if (Array.isArray(value)) {
      return value.map(item => cleanStegaData(item))
    }
    if (value && typeof value === 'object') {
      const cleaned = {}
      for (const key in value) {
        cleaned[key] = cleanStegaData(value[key])
      }
      return cleaned
    }
    return value
  }

  /**
   * Push data to GTM dataLayer
   * Automatically cleans Sanity Stega encoding from all strings
   * @param {Object} data - Data object to push to dataLayer
   */
  const pushToDataLayer = (data) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      const cleanedData = cleanStegaData(data)
      window.dataLayer.push(cleanedData)
      console.log('📊 GTM Event:', cleanedData.event || 'data', cleanedData)
    }
  }

  /**
   * Extract country from phone number based on country code
   * @param {string} phone - Full phone number with country code (e.g., '+33612345678')
   * @returns {string} - Country name or null
   */
  const getCountryFromPhone = (phone) => {
    if (!phone) return null

    const countryMap = {
      '+33': 'France',
      '+32': 'Belgium',
      '+1': 'Canada/USA',
      '+41': 'Switzerland',
      '+44': 'United Kingdom',
      '+39': 'Italy',
      '+34': 'Spain',
      '+49': 'Germany',
      '+352': 'Luxembourg',
      '+31': 'Netherlands',
    }

    // Find matching country code
    for (const [code, country] of Object.entries(countryMap)) {
      if (phone.startsWith(code)) {
        return country
      }
    }

    return null
  }

  /**
   * Track preload_data - pushes page_type to dataLayer (NO event key!)
   * This must be called BEFORE GTM processes the page_view
   * GTM will automatically fire page_view based on this data
   * @param {string} pageType - Type of page: 'Homepage', 'Page Voyage', 'Blog', 'Page Avis', 'Autres'
   */
  const trackPreloadData = (pageType) => {
    pushToDataLayer({
      event: 'preload_data',
      page_type: pageType,
    })
  }

  /**
   * Track view_promotion event
   * @param {string} promotionName - Name of the promotion banner
   */
  const trackViewPromotion = (promotionName) => {
    pushToDataLayer({
      event: 'view_promotion',
      promotion_name: promotionName,
    })
  }

  /**
   * Track select_promotion event
   * @param {string} promotionCardName - Name of the selected card
   * @param {string} promotionName - Name of the promotion banner
   */
  const trackSelectPromotion = (promotionCardName, promotionName) => {
    pushToDataLayer({
      event: 'select_promotion',
      promotion_card_name: promotionCardName,
      promotion_name: promotionName,
    })
  }

  /**
   * Track clic_nav_slider event
   */
  const trackNavSliderClick = () => {
    pushToDataLayer({
      event: 'clic_nav_slider',
    })
  }

  /**
   * Track view_item_list event
   * @param {Object} params - Parameters object
   * @param {string} params.currency - Currency code (e.g., 'EUR')
   * @param {Array} params.items - Array of item objects
   * @param {string} params.itemListName - Name of the item list
   */
  const trackViewItemList = ({ currency = 'EUR', items, itemListName }) => {
    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: {
        currency,
        items: items.map(item => ({
          item_id: item.itemId,
          item_name: item.itemName,
          item_category: item.itemCategory,
          item_category2: item.itemCategory2,
          item_category3: item.itemCategory3,
          item_category4: item.itemCategory4,
          item_category5: item.itemCategory5,
          price: item.price,
          discount: item.discount || 0,
          item_list_name: itemListName,
        })),
      },
    })
  }

  /**
   * Track select_item event
   * @param {Object} params - Parameters object
   * @param {string} params.currency - Currency code (e.g., 'EUR')
   * @param {Object} params.item - Item object
   * @param {string} params.itemListName - Name of the item list
   */
  const trackSelectItem = ({ currency = 'EUR', item, itemListName }) => {
    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        currency,
        items: [
          {
            item_id: item.itemId,
            item_name: item.itemName,
            item_category: item.itemCategory,
            item_category2: item.itemCategory2,
            item_category3: item.itemCategory3,
            item_category4: item.itemCategory4,
            item_category5: item.itemCategory5,
            price: item.price,
            discount: item.discount || 0,
            item_list_name: itemListName,
          },
        ],
      },
    })
  }

  /**
   * Track clic_rdv event
   */
  const trackRdvClick = () => {
    pushToDataLayer({
      event: 'clic_rdv',
    })
  }

  /**
   * Track clic_mail event
   */
  const trackMailClick = () => {
    pushToDataLayer({
      event: 'clic_mail',
    })
  }

  /**
   * Track clic_whatsapp event
   */
  const trackWhatsappClick = () => {
    pushToDataLayer({
      event: 'clic_whatsapp',
    })
  }

  /**
   * Track clic_appel event
   */
  const trackCallClick = () => {
    pushToDataLayer({
      event: 'clic_appel',
    })
  }

  /**
   * Track newsletter subscription
   * @param {string} userMail - User email
   */
  const trackNewsletterSubscription = (userMail) => {
    if (!userMail) return

    pushToDataLayer({
      event: 'newsletter',
      user_data: {
        user_mail: userMail,
      },
    })
  }

  /**
   * Track clic_faq event
   * @param {string} question - FAQ question text
   */
  const trackFaqClick = (question) => {
    pushToDataLayer({
      event: 'clic_faq',
      question,
    })
  }

  /**
   * Track clic_cta event
   * @param {Object} params - CTA parameters
   * @param {string} params.ctaId - CTA ID
   * @param {string} params.ctaLabel - CTA button text
   * @param {string} params.ctaUrl - CTA redirect URL
   */
  const trackCtaClick = ({ ctaId, ctaLabel, ctaUrl }) => {
    pushToDataLayer({
      event: 'clic_cta',
      cta_id: ctaId,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
    })
  }

  /**
   * Track clic_social_media event
   * @param {string} socialMedia - Social media name (e.g., 'TikTok', 'Facebook', 'Instagram')
   */
  const trackSocialMediaClick = (socialMedia) => {
    pushToDataLayer({
      event: 'clic_social_media',
      social_media: socialMedia,
    })
  }

  /**
   * Track clic_partage event
   */
  const trackShareClick = () => {
    pushToDataLayer({
      event: 'clic_partage',
    })
  }

  /**
   * Track voir_photos event
   */
  const trackViewPhotos = () => {
    pushToDataLayer({
      event: 'voir_photos',
    })
  }

  /**
   * Track search_bar event
   * @param {Object} params - Search parameters
   * @param {string} params.destination - Selected destination
   * @param {string} params.typeVoyage - Travel type
   * @param {string} params.periode - Selected period
   * @param {boolean} params.voyageGaranti - Guaranteed travel filter
   */
  const trackSearchBar = ({ destination, typeVoyage, periode, voyageGaranti }) => {
    pushToDataLayer({
      event: 'search_bar',
      destination,
      type_voyage: typeVoyage,
      periode,
      voyage_garanti: voyageGaranti ? 'true' : 'false',
    })
  }

  /**
   * Track search_term event
   * @param {string} searchTerm - Search term
   */
  const trackSearchTerm = (searchTerm) => {
    pushToDataLayer({
      event: 'search_term',
      search_term: searchTerm,
    })
  }

  /**
   * Track clic_menu event
   * @param {Object} params - Menu levels
   * @param {string} params.niv1 - Level 1 menu
   * @param {string} params.niv2 - Level 2 menu
   * @param {string} params.niv3 - Level 3 menu
   */
  const trackMenuClick = ({ niv1, niv2, niv3 }) => {
    pushToDataLayer({
      event: 'clic_menu',
      niv1,
      niv2,
      niv3,
    })
  }

  /**
   * Track view_item event - Product page view
   * CSV line 133
   */
  const trackViewItem = (voyage, totalValue = null) => {
    if (!voyage) return

    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        value: totalValue || voyage.price || 0,
        currency: 'EUR',
        items: [voyage],
      },
    })
  }

  /**
   * Track add_to_wishlist event - Date selection
   * CSV line 174
   */
  const trackAddToWishlist = (voyage, quantity = 1, totalValue = null) => {
    if (!voyage) return

    const itemWithQuantity = {
      ...voyage,
      quantity,
    }

    pushToDataLayer({
      event: 'add_to_wishlist',
      ecommerce: {
        value: totalValue || (voyage.price * quantity) || 0,
        currency: 'EUR',
        items: [itemWithQuantity],
      },
    })
  }

  /**
   * Track voir_photos event - Photo gallery opened
   * CSV line 1408
   */
  const trackVoirPhotos = () => {
    pushToDataLayer({
      event: 'voir_photos',
    })
  }

  /**
   * CHECKOUT FUNNEL TRACKING
   */

  /**
   * Track reservation steps - Generic funnel step tracking
   * @param {number} step - Step number (0-5)
   * @param {object} voyage - Formatted voyage data
   * @param {object} additionalData - Additional data for the step (can include user_data, optin_newsletter, etc.)
   *
   * Steps:
   * - Step 0: Funnel entry (CSV line 215)
   * - Step 1: Details step entry (CSV line 247)
   * - Step 2: Contact details submitted (CSV line 282) - includes optin_newsletter + user_data
   * - Step 3: Traveler info submitted (CSV line 323)
   * - Step 4: Options selected (CSV line 364)
   * - Step 5: Insurance selected (CSV line 405)
   */
  const trackReservationStep = (step, voyage, additionalData = {}) => {
    const dataLayerEvent = {
      event: `reservation_step${step}`,
      ecommerce: {
        value: voyage?.price || 0,
        currency: 'EUR',
        items: voyage ? [voyage] : [],
      },
    }

    // Add any additional data (optin_newsletter, user_data, etc.)
    Object.assign(dataLayerEvent, additionalData)

    pushToDataLayer(dataLayerEvent)
  }

  /**
   * Track add_payment_info - Payment method selected
   * CSV line 446
   */
  const trackAddPaymentInfo = (voyage, paymentType, userData = {}) => {
    pushToDataLayer({
      event: 'add_payment_info',
      ecommerce: {
        payment_type: paymentType,
        value: voyage?.price || 0,
        currency: 'EUR',
        items: voyage ? [voyage] : [],
      },
      user_data: userData,
    })
  }

  /**
   * Track reservation_pose_option - Option placement
   * CSV line 487
   */
  const trackReservationPoseOption = (voyage, userData = {}) => {
    pushToDataLayer({
      event: 'reservation_pose_option',
      ecommerce: {
        value: voyage?.price || 0,
        currency: 'EUR',
        items: voyage ? [voyage] : [],
      },
      user_data: userData,
    })
  }

  /**
   * CALENDLY RDV FUNNEL (Checkout context)
   * Track reservation RDV steps - Generic RDV funnel tracking
   * @param {number} step - Step number (1-2) or 'confirmation'
   * @param {object} voyage - Formatted voyage data (optional for reservation context)
   * @param {object} userData - Additional user data
   *
   * Steps:
   * - Step 1: Calendly opened in funnel (CSV line 528)
   * - Step 2: Date selected in Calendly (CSV line 569)
   * - confirmation: Booking confirmed (CSV line 610)
   */
  const trackReservationRdvStep = (step, voyage, userData = {}) => {
    const eventName = typeof step === 'number'
      ? `reservation_rdv_step${step}`
      : 'reservation_rdv_confirmation'

    pushToDataLayer({
      event: eventName,
      ecommerce: voyage
        ? {
            value: voyage.price || 0,
            currency: 'EUR',
            items: [voyage],
          }
        : undefined,
      user_data: userData,
    })
  }

  /**
   * STANDALONE RDV TRACKING (Non-funnel context)
   * Track standalone RDV steps - For /calendly page
   * @param {number} step - Step number (0-1) or 'confirmation'
   *
   * Steps:
   * - Step 0: RDV page loaded (CSV line 651)
   * - Step 1: Calendly loaded (CSV line 692)
   * - confirmation: RDV confirmed (CSV line 733)
   */
  const trackRdvStep = (step) => {
    const eventName = typeof step === 'number'
      ? `rdv_step${step}`
      : 'rdv_confirmation'

    pushToDataLayer({
      event: eventName,
    })
  }

  /**
   * DEVIS FUNNEL TRACKING
   * Track devis (quote) steps - Generic devis funnel tracking
   * @param {string} type - Devis type: 'classic', 'rdv', or 'surmesure'
   * @param {number} step - Step number (0-2) or 'confirmation'
   * @param {object} voyage - Formatted voyage data (optional)
   * @param {object} userData - Additional user data
   *
   * Steps:
   * - Step 0: Devis page loaded (CSV line 774)
   * - Step 1: Choice selected (classic/rdv/surmesure) (CSV lines 815, 856, 897)
   * - Step 2: Details submitted (classic only) (CSV line 938)
   * - confirmation: Form submitted (classic only) (CSV line 979)
   *
   * For RDV: Uses same Calendly tracking as checkout (rdv_stepX)
   */
  const trackDevisStep = (type, step, voyage = null, userData = {}) => {
    let eventName
    if (typeof step === 'number') {
      eventName = `devis_${type}_step${step}`
    }
    else {
      eventName = `devis_${type}_confirmation`
    }

    const dataLayerEvent = {
      event: eventName,
    }

    // Add ecommerce data if voyage is provided
    if (voyage) {
      dataLayerEvent.ecommerce = {
        value: voyage.price || 0,
        currency: 'EUR',
        items: [voyage],
      }
    }

    // Add user data if provided
    if (Object.keys(userData).length > 0) {
      dataLayerEvent.user_data = userData
    }

    pushToDataLayer(dataLayerEvent)
  }

  return {
    pushToDataLayer,
    getCountryFromPhone,
    trackPreloadData,
    trackViewPromotion,
    trackSelectPromotion,
    trackNavSliderClick,
    trackViewItemList,
    trackSelectItem,
    trackViewItem,
    trackAddToWishlist,
    trackVoirPhotos,
    trackRdvClick,
    trackMailClick,
    trackWhatsappClick,
    trackCallClick,
    trackNewsletterSubscription,
    trackFaqClick,
    trackCtaClick,
    trackSocialMediaClick,
    trackShareClick,
    trackViewPhotos,
    trackSearchBar,
    trackSearchTerm,
    trackMenuClick,
    // Checkout funnel
    trackReservationStep,
    trackAddPaymentInfo,
    trackReservationPoseOption,
    trackReservationRdvStep,
    // Standalone RDV
    trackRdvStep,
    // Devis funnel
    trackDevisStep,
  }
}
