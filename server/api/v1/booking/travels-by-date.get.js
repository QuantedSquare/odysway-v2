import { defineEventHandler } from 'h3'
import dayjs from 'dayjs'
import { createClient } from '@sanity/client'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })
  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, departure_date, return_date, early_bird, last_minute, starting_price')
    .eq('published', true)
    .eq('is_custom_travel', false)
    .gte('departure_date', new Date().toISOString())

  if (error) {
    return []
  }

  const parsedDatesByExtra = data.map(date => ({
    ...date,
    departure_date: new Date(date.departure_date),
    early_bird: dayjs().isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false,
    last_minute: dayjs(date.departure_date).diff(dayjs(), 'day') <= 31 ? date.last_minute : false,
  }))

  const travelsQuery = `*[_type == "voyage" && (
    !('custom' in availabilityTypes)
  )]{
    "slug": slug.current,
    title,
    image,
    rating,
    comments,
    availabilityTypes,
    "startingPrice": pricing.startingPrice,
    duration,
    destinations[]-> {
      _id,
      title,
      iso
    }
  }`

  const travels = await sanityClient.fetch(travelsQuery)

  const travelWithDates = travels.map((travel) => {
    const dates = parsedDatesByExtra.filter(date => date.travel_slug === travel.slug)
    return {
      slug: travel.slug,
      title: travel.title,
      image: travel.image,
      rating: travel.rating,
      comments: travel.comments,
      availabilityTypes: travel.availabilityTypes,
      startingPrice: travel.startingPrice,
      iso: travel.destinations?.map(destination => destination.iso).filter(Boolean) || [],
      dates,
      duration: travel.duration,
    }
  })
  return travelWithDates
})
