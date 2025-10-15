export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const pathSegments = decodeURIComponent(to.path).split('/')
    const voyageSlug = pathSegments[pathSegments.length - 1]
    const cleanVoyageSlug = replaceFrenchAccents(voyageSlug)
    const sanity = useSanity()
    const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
      published,
      slug
    }`
    const voyage = await sanity.fetch(voyageQuery, { slug: cleanVoyageSlug })
    if (voyage?.published === true) {
      const targetPath = `/voyages/${voyage.slug.current}`
      // Only redirect if not already on the correct path
      if (to.path !== targetPath) {
        return navigateTo(targetPath)
      }
      // else: already on the correct path, do nothing
    }
  }
  catch (e) {
    console.error(e)
  }
})

function replaceFrenchAccents(str) {
  const accentMap = {
    à: 'a', â: 'a', ä: 'a',
    ç: 'c',
    é: 'e', è: 'e', ê: 'e', ë: 'e',
    î: 'i', ï: 'i',
    ô: 'o', ö: 'o',
    ù: 'u', û: 'u', ü: 'u',
    ÿ: 'y',
    À: 'A', Â: 'A', Ä: 'A',
    Ç: 'C',
    É: 'E', È: 'E', Ê: 'E', Ë: 'E',
    Î: 'I', Ï: 'I',
    Ô: 'O', Ö: 'O',
    Ù: 'U', Û: 'U', Ü: 'U',
    Ÿ: 'Y',
  }
  return str.replace(/[àâäçéèêëîïôöùûüÿÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]/g, match => accentMap[match] || match)
}
