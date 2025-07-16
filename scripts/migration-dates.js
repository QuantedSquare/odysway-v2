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
  const mapped = datesVoyagesGroupe.map((date) => {
    return {
      published: true,
      travel_slug: slugify(date.voyage.slug, { lower: true, strict: true }),
      departure_date: date.date_debut,
      return_date: date.date_fin,
      max_travelers: Math.abs(date.voyage.number_catchline_tab_group) > 0 ? Math.abs(date.voyage.number_catchline_tab_group) : 6,
      min_travelers: +date.nb_confirmation > 0 ? +date.nb_confirmation : 2,
      displayed_status: date.voyage_complet_indisponible ? 'guaranteed' : date.nb_confirmation > 0 ? 'soon_confirmed' : 'confirmed',
      starting_price: date.prix_voyage || 0,
      early_bird: date.voyage.got_earlybird,
      last_minute: date.last_minute_disponible,
      include_flight: date.voyage.vol_inclus || false,
      flight_price: date.voyage.prix_avion || 0,
      booked_seat: 0,
      badges: '',
      is_indiv_travel: false,
      custom_display: false,
      deleted: false,
    }
  })

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
