import { setHeader } from 'h3'
import { SITE_BANNER_QUERY } from '~~/shared/utils/siteBanner'
import { sanityFreshClient } from '~~/server/utils/sanityClients'

/**
 * The site banner, outside the ISR cache.
 *
 * Pages are cached for 1 to 5 days, so the banner baked into their HTML can be
 * days old — and a sweep still needs ~1 minute to walk every page. This endpoint is
 * what makes "turn the promo banner off" immediate: SiteBanner.vue renders the
 * cached copy (no layout shift in the normal case, where nothing changed) and
 * reconciles against this after hydration.
 *
 * Cost: ~1KB, one entry for every visitor, 60s at the edge. The Sanity read behind
 * it bypasses the API CDN, but at most once per minute per region.
 */
export default defineCachedEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
  const banner = await sanityFreshClient().fetch(SITE_BANNER_QUERY)
  return banner || null
}, {
  maxAge: 60,
  swr: true,
  name: 'globals',
  getKey: () => 'site-banner',
})
