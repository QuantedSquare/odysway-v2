import { getQuery, eventHandler } from 'h3'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

  if (searchTerm && searchTerm.length > 0) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()

    const [destinations, regions, voyages] = await Promise.all([
      queryCollection(event, 'destinations')
        .select('title', 'slug')
        .where('published', '=', true)
        .all(),
      queryCollection(event, 'regions')
        .select('nom', 'slug')
        .all(),
      queryCollection(event, 'voyages')
        .select('title', 'slug')
        .where('published', '=', true)
        .all(),
    ])

    const filterAndMapData = (data, nameKey, dataSource) => {
      return data
        .filter((item) => {
          const name = item[nameKey] || ''
          return name.toLowerCase().includes(lowerCaseSearchTerm) || item.slug.includes(lowerCaseSearchTerm)
        })
        .map(item => ({
          title: item[nameKey],
          slug: item.slug,
          dataSource,
        }))
    }

    const searchResults = [
      ...filterAndMapData(destinations, 'title', 'destinations'),
      ...filterAndMapData(regions, 'nom', 'regions'),
      ...filterAndMapData(voyages, 'title', 'voyages'),
    ]

    return searchResults
  }
  else {
    const [destinations, regions] = await Promise.all([
      queryCollection(event, 'destinations')
        .select('title', 'slug', 'isTopDestination')
        .where('published', '=', true)
        .all(),
      queryCollection(event, 'regions')
        .select('nom', 'slug')
        .all(),
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
