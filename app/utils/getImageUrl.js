import imageUrlBuilder from '@sanity/image-url'

// Initialize Sanity image URL builder

export function getImageUrl(ref, vanityName = null) {
  const config = useRuntimeConfig()
  const builder = imageUrlBuilder({
    // baseUrl: config.public.siteURL || 'https://odysway.com', // Only available for Entreprise account on Sanity
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
  })
  if (!ref)
    return ''

  try {
    const imageBuilder = builder
      .image(ref)
      .format('webp')
      .fit('max')
      .width(1200)

    // Add vanity name for SEO if provided
    if (vanityName) {
      return imageBuilder.vanityName(vanityName).url()
    }
    else {
      return imageBuilder.url()
    }
  }
  catch (error) {
    console.error('Error generating image URL:', error)
    return ''
  }
}
