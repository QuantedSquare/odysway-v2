export default eventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.keyword

  if (searchTerm && typeof searchTerm === 'string' && searchTerm.length > 0) {
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

    function filterAndMapData(data, dataSource) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()

      return data
        .filter((item) => {
          const name = item.title || item.nom
          return name.toLowerCase().includes(lowerCaseSearchTerm) || item.slug.includes(lowerCaseSearchTerm)
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
    const destinations = await queryCollection(event, 'destinations')
      .select('title', 'slug', 'isTopDestination')
      .where('published', '=', true)
      .all()

    const topDestinations = destinations
      .filter(destination => destination.isTopDestination)
      .map(destination => ({
        title: destination.title,
        slug: destination.slug,
        dataSource: 'destinations',
      }))

    return topDestinations
  }
})
