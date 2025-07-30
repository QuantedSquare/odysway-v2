import slugify from 'slugify'

function replaceFrenchAccents(str) {
  const pathSegments = decodeURIComponent(str).split('/')
  const voyageSlug = pathSegments[pathSegments.length - 1]

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
  return voyageSlug.replace(/[àâäçéèêëîïôöùûüÿÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]/g, match => accentMap[match] || match)
}

console.log(replaceFrenchAccents('localhost:3000/voyages/voyage-costa-rica-immersion-communaut%C3%A9-locale'))
