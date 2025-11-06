import imageUrlBuilder from '@sanity/image-url'

export function testGetImageUrl(image, vanityName = null) {
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

    const srcUrl = buildSanityImageUrl(800, 470, 70)

    const srcSet = [
      `${buildSanityImageUrl(400, 400, 60)} 400w`,
      `${buildSanityImageUrl(600, 350, 65)} 600w`,
      `${buildSanityImageUrl(800, 470, 70)} 800w`,
      `${buildSanityImageUrl(1000, 590, 75)} 1000w`,
      `${buildSanityImageUrl(1280, 750, 75)} 1280w`,
    ].join(', ')
    return { srcUrl, srcSet }
  }
  catch (error) {
    console.error('Error generating image URL:', error)
  }
}
