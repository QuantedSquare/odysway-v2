// Single source of truth for the site banner query.
//
// The banner is read twice with two different freshness guarantees, and the two
// reads MUST project the same fields or the client reconciliation in
// SiteBanner.vue would swap a full document for a partial one:
//   - SSR, through useSanityQuery (baked into the ISR HTML, so up to 1 day old);
//   - after hydration, through /api/v1/globals/banner (edge-cached 60s).
export const SITE_BANNER_QUERY = `*[_type == "siteBanner"][0]{
  _rev,
  enabled,
  variant,
  tag,
  ctaLabel,
  ctaHref,
  dismissible,
  startDate,
  endDate,
  content[]{
    ...,
    _type == "image" => { ..., "url": asset->url }
  }
}`
