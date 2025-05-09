import fs from 'node:fs'
import slugify from 'slugify'
import supabase from '../server/utils/supabase.js'

function readJson(filename) {
  const data = JSON.parse(fs.readFileSync(filename))
  return data
}

async function migrateDatesToSupabase() {
  const datesVoyagesGroupe = readJson('./butter-data/dates-groups.json')

  // Map each entry to the travel_dates schema
  const mapped = datesVoyagesGroupe.map(date => ({
    travel_slug: slugify(date.voyage.slug, { lower: true }),
    published: true,
    displayed_status: date.voyage_complet_indisponible ? 'guaranteed' : date.nb_confirmation > 0 ? 'soon_confirmed' : 'confirmed',
    departure_date: date.date_debut,
    return_date: date.date_fin,
    starting_price: date.prix_voyage || 0,
    max_travelers: date.voyage.number_catchline_tab_group || 6,
    min_travelers: +date.nb_confirmation > 0 ? +date.nb_confirmation : 2,
    early_bird: date.voyage.got_earlybird,
    last_minute: date.last_minute_disponible,
    include_flight: date.voyage.vol_inclus || false,
    booked_seat: date.nombre_de_pax_disponible || 0,
    flight_price: date.voyage.prix_avion || 0,
    badges: '',
  }))

  // Bulk insert
  const { data, error } = await supabase
    .from('travel_dates')
    .insert(mapped)

  if (error) {
    console.error('Error inserting travel_dates:', error)
  }
  else {
    console.log('Inserted travel_dates:', data?.length || 0)
  }
}

migrateDatesToSupabase()
