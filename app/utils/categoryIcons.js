import {
  mdiHiking,
  mdiAccountGroupOutline,
  mdiBinoculars,
  mdiLeaf,
  mdiHomeHeart,
  mdiTent,
  mdiTerrain,
  mdiMeditation,
  mdiSilverwareForkKnife,
  mdiWaves,
  mdiPaw,
  mdiCompassOutline,
} from '@mdi/js'

// Keys exposed in the Sanity category "icon" select. Keep in sync with the
// schema option list in cms/schemaTypes/categoryType.ts.
const map = {
  trek: mdiHiking,
  rencontres: mdiAccountGroupOutline,
  faune: mdiBinoculars,
  deconnexion: mdiLeaf,
  familles: mdiHomeHeart,
  desert: mdiTent,
  montagne: mdiTerrain,
  spiritualite: mdiMeditation,
  gastronomie: mdiSilverwareForkKnife,
  mer: mdiWaves,
  animaux: mdiPaw,
}

// Returns an mdi path for a category icon key, with a sensible default.
export function categoryIcon(key) {
  return map[key] || mdiCompassOutline
}
