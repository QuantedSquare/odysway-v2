import imageUrlBuilder from '@sanity/image-url'

export function useImageBuilder(image) {
  const config = useRuntimeConfig()
  const builder = imageUrlBuilder({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
  })

  // Build optimized Sanity URLs with proper sizes for each breakpoint
  const buildSanityImageUrl = (width, height, quality = 75) => {
    if (!image?.asset?._ref) return ''
    return builder
      .image(image.asset._ref)
      .width(width)
      .height(height)
      .format('webp')
      .quality(quality)
      .fit('max')
      .url()
  }

  const srcUrl = computed(() => {
    // Default to 800px as fallback for common desktop viewport
    return buildSanityImageUrl(800, 470, 70)
  })

  const srcSet = computed(() => {
    // Generate srcset matching actual container widths accounting for padding
    // Heights calculated to maintain 1.7:1 aspect ratio (hero section aspect)
    return [
      `${buildSanityImageUrl(400, 235, 60)} 400w`,
      `${buildSanityImageUrl(600, 350, 65)} 600w`,
      `${buildSanityImageUrl(800, 470, 70)} 800w`,
      `${buildSanityImageUrl(1000, 590, 75)} 1000w`,
      `${buildSanityImageUrl(1280, 750, 75)} 1280w`,
    ].join(', ')
  })

  return { srcUrl, srcSet }
}
