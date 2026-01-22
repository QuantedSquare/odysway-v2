/**
 * GTM DataLayer Tracking Composable
 * Manages all Google Tag Manager dataLayer push events
 */

export const useGtmTracking = () => {
  /**
   * Push data to GTM dataLayer
   * @param {Object} data - Data object to push to dataLayer
   */
  const pushToDataLayer = (data) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(data)
      console.log('📊 GTM Event:', data.event, data)
    }
  }

  /**
   * Track preload_data event (must be called BEFORE page_view)
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

  return {
    pushToDataLayer,
    trackPreloadData,
    trackViewPromotion,
    trackSelectPromotion,
    trackNavSliderClick,
    trackViewItemList,
    trackSelectItem,
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
  }
}
