import dayjs from 'dayjs'

export default function (departureDate, queryParams) {
  // If amount is specified in query, use that (custom payment)
  if (queryParams.amount) {
    return 'custom'
  }
  if (queryParams.type === 'balance') {
    return 'balance'
  }

  // Otherwise calculate based on dates
  const today = dayjs()
  const departureDateFormated = dayjs(departureDate, 'YYYY-MM-DD')
  const daysDiff = departureDateFormated.diff(today, 'day')
  console.log('daysdif', daysDiff)
  // Warning check if full can be full or rest to pay
  return daysDiff > 30 ? 'deposit' : 'full'
}
