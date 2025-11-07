import { getQuery, eventHandler } from 'h3'
import { createClient } from '@sanity/client'
import { distance } from 'fastest-levenshtein'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

  if (searchTerm && searchTerm.length > 0) {
    const allVoyages = await sanityClient.fetch(`
      *[_type == "voyage" && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
        title,
        "slug": slug.current,
        description,
        authorNote,
        destinations[]->{
          regions[]->{
            nom,
            "slug": slug.current,
          }
        },
        experienceType->{
          badgeTitle
        },
        categories[]->{
          title
        }
      }
    `)

    // Helper to extract text from referenced objects for scoring
    function getReferenceText(item) {
      const texts = []

      item.destinations?.forEach((d) => {
        d.regions?.forEach((r) => {
          texts.push(r.nom)
        })
      })

      if (item.experienceType?.badgeTitle) {
        texts.push(item.experienceType.badgeTitle)
      }

      item.categories?.forEach(c => texts.push(c.title))

      return texts.filter(Boolean).join(' ').toLowerCase()
    }

    function calculateScore(item, keywords) {
      let score = 0

      const directText = ([item.title, item.authorNote, item.description].filter(Boolean).join(' ').toLowerCase())
      const referenceText = getReferenceText(item)
      const searchableText = directText + ' ' + referenceText

      // Split text into individual words for fuzzy matching
      const searchableWords = searchableText.split(/\s+/).filter(w => w.length > 0)

      let isMatch = false
      const MAX_EDIT_DISTANCE = 1 // Allows one typos

      keywords.forEach((keyword) => {
        let keywordFoundFuzzy = false

        for (const docWord of searchableWords) {
          // USE THE FASTEST-LEVENSHTEIN FUNCTION
          const dist = distance(keyword, docWord)

          if (dist === 0) {
            // Exact match (highest score)
            score += 5
            isMatch = true
            keywordFoundFuzzy = true
            break // Found an exact match, move to next keyword
          }
          else if (dist <= MAX_EDIT_DISTANCE) {
            // Fuzzy match (medium score)
            score += 2
            isMatch = true
            keywordFoundFuzzy = true
          }
        }

        // High relevance boost for title match (Fuzzy check)
        const titleWords = (item.title || '').toLowerCase().split(/\s+/).filter(w => w.length > 0)
        if (titleWords.some(tWord => distance(keyword, tWord) <= MAX_EDIT_DISTANCE)) {
          score += 5
        }

        // Minor boost if a match (fuzzy or exact) was found in the referenced data
        if (keywordFoundFuzzy) {
          score += 2
        }
      })

      return { score, isMatch }
    }

    // --- KEYWORD PREPARATION ---
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    // Keep only letters and numbers
    const cleanedSearchTerm = lowerCaseSearchTerm.replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    const keywords = cleanedSearchTerm.split(' ').filter(k => k.length > 0)
    // ---------------------------

    const initialScoredResults = allVoyages.map((item) => {
      const { score, isMatch } = calculateScore(item, keywords)
      return {
        ...item,
        score,
        isMatch,
      }
    })

    const filteredAndScoredResults = initialScoredResults.filter(item => item.isMatch)

    // Sort results by score, descending (most relevant first)
    filteredAndScoredResults.sort((a, b) => b.score - a.score)

    const searchResults = filteredAndScoredResults.map(item => ({
      title: item.title,
      slug: item.slug,
      dataSource: 'voyages',
    }))

    return searchResults
  }
  else {
    const [destinations, regions] = await Promise.all([
      sanityClient.fetch(`*[_type == "destination"]{
        title,
        "slug": slug.current,
        isTopDestination
      }`),
      sanityClient.fetch(`*[_type == "region"]{
        nom,
        "slug": slug.current
      }`),
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
