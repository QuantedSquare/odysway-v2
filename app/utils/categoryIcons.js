import {
  IconWalk,
  IconUsers,
  IconBinoculars,
  IconLeaf,
  IconHome,
  IconTent,
  IconMountain,
  IconYoga,
  IconToolsKitchen2,
  IconBeach,
  IconPaw,
  IconTrees,
  IconCamera,
  IconTorii,
  IconSnowflake,
  IconTelescope,
  IconBuildingMonument,
  IconBike,
  IconPlant2,
  IconSailboat,
  IconCar,
  IconCompass,
} from '@tabler/icons-vue'

// Keys exposed in the Sanity category "icon" select. Keep in sync with the
// schema option list in cms/schemaTypes/categoryType.ts.
const map = {
  // Nature & paysages
  montagne: IconMountain,
  desert: IconTent,
  mer: IconBeach,
  jungle: IconPlant2,
  automne: IconTrees,
  hiver: IconSnowflake,
  // Faune & activités
  faune: IconBinoculars,
  animaux: IconPaw,
  trek: IconWalk,
  velo: IconBike,
  voile: IconSailboat,
  roadtrip: IconCar,
  photo: IconCamera,
  // Culture & rencontres
  rencontres: IconUsers,
  familles: IconHome,
  gastronomie: IconToolsKitchen2,
  asie: IconTorii,
  culture: IconBuildingMonument,
  spiritualite: IconYoga,
  astronomie: IconTelescope,
  // Bien-être
  deconnexion: IconLeaf,
}

// Returns a Tabler icon component for a category icon key, with a sensible default.
export function categoryIcon(key) {
  return map[key] || IconCompass
}
