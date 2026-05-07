import imageUrlBuilder from '@sanity/image-url'

// Initialize Sanity image URL builder

export function getImageUrl(ref, vanityName = null, config = null, width = 1200) {
  const runtimeConfig = config || useRuntimeConfig()
  const builder = imageUrlBuilder({
    // baseUrl: runtimeConfig.public.siteURL || 'https://odysway.com', // Only available for Entreprise account on Sanity
    projectId: runtimeConfig.public.sanity.projectId,
    dataset: runtimeConfig.public.sanity.dataset,
  })
  if (!ref)
    return ''

  try {
    const imageBuilder = builder
      .image(ref)
      .format('webp')
      .fit('max')
      .width(width)

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
