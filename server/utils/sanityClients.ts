import { createClient, type SanityClient } from '@sanity/client'

/**
 * Two server-side Sanity clients, kept apart on purpose.
 *
 * `sanityFreshClient` never uses the API CDN: it is for reads that happen right
 * after a mutation (resolving references, enumerating paths, serving the live
 * banner), where a 30-60s stale answer is a bug.
 *
 * `sanityAsPagesClient` mirrors the `sanity.useCdn` setting the pages themselves
 * run with (nuxt.config), and exists only to answer "would a page render right now
 * see the new revision?" before we regenerate it.
 */

let fresh: SanityClient | undefined
let asPages: SanityClient | undefined

function baseOptions() {
  const config = useRuntimeConfig()
  return {
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
  }
}

export function sanityFreshClient(): SanityClient {
  if (!fresh) fresh = createClient({ ...baseOptions(), useCdn: false })
  return fresh
}

export function sanityAsPagesClient(): SanityClient {
  if (!asPages) asPages = createClient({ ...baseOptions(), useCdn: process.env.VERCEL_ENV === 'production' })
  return asPages
}
