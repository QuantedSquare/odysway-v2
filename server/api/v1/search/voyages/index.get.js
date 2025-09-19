import { getQuery, eventHandler } from 'h3'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

  if (searchTerm && searchTerm.length > 0) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()

    const [destinations, regions, voyages] = await Promise.all([
      queryCollection(event, 'destinations').select('title', 'slug').where('published', '=', true).all(),
      queryCollection(event, 'regions').select('nom', 'slug').all(),
      queryCollection(event, 'voyages').select('title', 'slug').where('published', '=', true).all(),
    ])

    function filterAndMapData(data, dataSource) {
      return data
        .filter((item) => {
          const name = item.title || item.nom
          return name.toLowerCase().includes(lowerCaseSearchTerm) || item.slug.includes(lowerCaseSearchTerm)
        })
        .map(item => ({
          title: item.title || item.nom,
          slug: item.slug,
          dataSource,
        }))
    }

    const searchResults = [
      ...filterAndMapData(destinations, 'destinations'),
      ...filterAndMapData(regions, 'regions'),
      ...filterAndMapData(voyages, 'voyages'),
    ]

    return searchResults
  }
  else {
    const [destinations, regions] = await Promise.all([
      queryCollection(event, 'destinations').select('title', 'slug', 'isTopDestination').where('published', '=', true).all(),
      queryCollection(event, 'regions').select('nom', 'slug').all(),
    ])

    const topDestinations = destinations
      .filter(destination => destination.isTopDestination)
      .map(destination => ({
        title: destination.title,
        slug: destination.slug,
        dataSource: 'destinations',
      }))

    const regionsMap = regions.map(region => ({
      title: region.nom,
      slug: region.slug,
      dataSource: 'regions',
    }))

    return [...topDestinations, ...regionsMap]
  }
})
