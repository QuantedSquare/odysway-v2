/**
 * Composable for fetching Sanity category data with SSR support
 *
 * This composable demonstrates best practices for:
 * - Server-side rendering (SSR)
 * - Client-side navigation
 * - Reactive data fetching
 * - Proper error handling
 * - Data caching
 */
export function useSanityCategory(slug) {
  // GROQ query with proper image asset expansion
  const categoryQuery = `
    *[_type == "category" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      blog->{
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        seo,
        mainImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        },
        body[]{
          ...,
          _type == "image" => {
            ...,
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            }
          }
        },
        author->{
          _id,
          name,
          image,
          position
        }
      }
    }
  `

  /**
   * useAsyncData with SSR configuration
   *
   * Key features:
   * 1. Unique key per slug for proper caching
   * 2. watch: [slug] for reactive updates when slug changes
   * 3. server: true to enable SSR
   */
  const sanity = useSanity()
  const {
    data: category,
    error,
    pending,
    refresh,
  } = useAsyncData(
    `category-${unref(slug)}`, // Unique key with slug
    async () => {
      const result = await sanity.fetch(categoryQuery, {
        slug: unref(slug),
      })
      return result || null
    },
    {
      // Watch slug changes and refetch
      watch: [slug],
      // Enable server-side rendering
      server: true,
    },
  )

  return {
    category,
    error,
    pending,
    refresh,
  }
}
