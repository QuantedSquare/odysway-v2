import { defineEventHandler, getQuery } from 'h3'
import dayjs from 'dayjs'
import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slugs } = getQuery(event)

  const slugList = typeof slugs === 'string'
    ? slugs.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (!slugList.length) {
    return []
  }

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  // Verify requested slugs exist to avoid useless DB hits
  const sanitySlugs = await sanityClient.fetch(
    '*[_type == "voyage" && slug.current in $slugs][].slug.current',
    { slugs: slugList },
  )
  if (!sanitySlugs?.length) return []

  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, displayed_booked_seat, departure_date, return_date, early_bird, last_minute, starting_price, max_travelers, min_travelers, status, displayed_status, displayed_badges')
    .in('travel_slug', sanitySlugs)
    .eq('published', true)
    .eq('is_custom_travel', false)
    .gte('departure_date', new Date().toISOString())

  if (error) {
    console.error('travel-dates supabase error', error)
    return []
  }

  return data.map(date => ({
    ...date,
    departure_date: new Date(date.departure_date),
    early_bird: dayjs().isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false,
    last_minute: dayjs(date.departure_date).diff(dayjs(), 'day') <= 31 ? date.last_minute : false,
  }))
})
