import { defineEventHandler } from 'h3'
import dayjs from 'dayjs'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, departure_date, return_date, early_bird, last_minute, starting_price')
    .eq('published', true)
    .eq('is_custom_travel', false)
    .gte('departure_date', new Date().toISOString())

  const parsedDatesByExtra = data.map(date => ({
    ...date,
    departure_date: new Date(date.departure_date),
    early_bird: dayjs().isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false,
    last_minute: dayjs(date.departure_date).diff(dayjs(), 'day') <= 31 ? date.last_minute : false,
  }))

  const travels = await queryCollection(event, 'voyages').where('published', '=', true).all()
  const destinations = await queryCollection(event, 'destinations').where('published', '=', true).all()
  if (error) {
    return []
  }

  const travelWithDates = travels.map((travel) => {
    const dates = parsedDatesByExtra.filter(date => date.travel_slug === travel.slug)
    return {
      slug: travel.slug,
      title: travel.title,
      image: travel.image,
      rating: travel.rating,
      comments: travel.comments,
      groupeAvailable: travel.groupeAvailable,
      startingPrice: travel.pricing.startingPrice,
      iso: travel.destinations.map(destination => destinations.find(d => d.titre === destination.name)?.iso),
      dates,
    }
  })
  return travelWithDates
})
