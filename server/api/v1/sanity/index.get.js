import { getQuery, eventHandler, createError } from 'h3'
import { createClient } from '@sanity/client'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  const query = getQuery(event)
  const slug = query.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required',
    })
  }

  const voyage = await sanityClient.fetch(
    `*[_type == "voyage" && slug.current == $slug][0]{
      ...,
      "slug": slug.current,
      image {
        asset -> {
          url
        }
      },
      destinations[]-> {
        _id,
        title,
        iso,
        chapka
      }
    }`,
    { slug },
  )
  if (!voyage) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Voyage not found',
    })
  }

  return voyage
})
