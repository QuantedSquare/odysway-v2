// Shared data source for the destinations landing page and the topbar
// destinations menu (desktop mega-menu + mobile drawer). Fetches every region
// with the destinations that reference it, then shapes them into ordered
// "zones" (continents) each holding its country tiles.
//
// Returns `{ zones, asyncData }`:
//  - `zones`    computed list of continents (ready after the fetch resolves).
//  - `asyncData` the awaitable useSanityQuery handle; `await asyncData` on a
//               page blocks SSR so `zones` is populated in the payload.
// Components that only need the (eventually reactive) list can ignore
// `asyncData` and never turn into async components.
const destinationsMenuQuery = groq`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current,
  image,
  "destinations": *[_type == "destination" && references(^._id) && count(*[_type == "voyage" && references(^._id) && !('custom' in availabilityTypes)]) > 0] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    image
  }
}`

// Display order for the continents. Regions not listed keep their natural order
// after the known ones.
const ZONE_ORDER = [
  'france',
  'europe',
  'asie',
  'afrique',
  'amerique-du-sud',
  'amerique-centrale',
  'amerique-du-nord',
  'moyen-orient',
  'oceanie',
]

export function useDestinationsMenu() {
  const asyncData = useSanityQuery(destinationsMenuQuery, {}, { default: () => [] })

  const zones = computed(() => (asyncData.data.value || [])
    .map(region => ({
      id: region._id,
      name: region.nom,
      slug: region.slug,
      image: region.image,
      destinations: (region.destinations || [])
        .filter(destination => destination.slug && destination.image?.asset?._ref),
    }))
    .filter(zone => zone.slug && zone.destinations.length)
    .sort((a, b) => {
      const ia = ZONE_ORDER.indexOf(a.slug)
      const ib = ZONE_ORDER.indexOf(b.slug)
      return (ia === -1 ? ZONE_ORDER.length : ia) - (ib === -1 ? ZONE_ORDER.length : ib)
    }))

  return { zones, asyncData }
}
