import dayjs from 'dayjs'

export default function (dates) {
  const today = dayjs()
  let closestTrip = null
  for (const trip of dates) {
    const departure = dayjs(trip.departureDate)

    if (trip.maxTravellers > trip.bookedPlaces && departure.isAfter(today)) {
      if (!closestTrip || departure.isBefore(dayjs(closestTrip.departureDate))) {
        closestTrip = trip
      }
    }
  }
  return closestTrip
}
