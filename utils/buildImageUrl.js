import imageUrlBuilder from '@sanity/image-url'

export function buildImageUrl(image, vanityName = null, width = null) {
  const config = useRuntimeConfig()
  const builder = imageUrlBuilder({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
  })

  if (!image?.asset?._ref) return { srcUrl: '', srcSet: '' }

  try {
    const buildSanityImageUrl = (width, height, quality = 75) => {
      const imageBuild = builder
        .image(image.asset._ref)
        .width(width)
        .height(height)
        .format('webp')
        .quality(quality)
        .fit('max')

      if (vanityName) {
        return imageBuild.vanityName(vanityName).url()
      }

      return imageBuild.url()
    }
    // Default to 800px as fallback for common desktop viewport
    const srcUrl = buildSanityImageUrl(800, 470, 70)

    // Generate srcset matching actual container widths accounting for padding
    // Heights calculated to maintain 1.7:1 aspect ratio (hero section aspect)
    let srcSet = [
      `${buildSanityImageUrl(400, 400, 60)} 400w`,
      `${buildSanityImageUrl(600, 350, 65)} 600w`,
      `${buildSanityImageUrl(800, 470, 70)} 800w`,
      `${buildSanityImageUrl(1000, 590, 75)} 1000w`,
      `${buildSanityImageUrl(1280, 750, 75)} 1280w`,
    ].join(', ')

    if (width && width <= 600) {
      srcSet = [
        `${buildSanityImageUrl(400, 400, 60)} 400w`,
        `${buildSanityImageUrl(600, 350, 65)} 600w`,
        `${buildSanityImageUrl(600, 350, 70)} 800w`,
        `${buildSanityImageUrl(600, 350, 75)} 1000w`,
        `${buildSanityImageUrl(600, 350, 75)} 1280w`,
      ].join(', ')
    }
    return { srcUrl, srcSet }
  }
  catch (error) {
    console.error('Error generating image URL:', error)
  }
}
