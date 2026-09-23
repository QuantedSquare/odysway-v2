import apiRequest from '~/utils/apiRequest'

export function getApiErrorMessage(err, fallback = 'Erreur inattendue.') {
  return (
    err?.data?.statusMessage
    || err?.data?.message
    || err?.statusMessage
    || err?.message
    || fallback
  )
}

// Appels du funnel public. Le back-office (dates, marges, corbeille, factures…)
// est désormais piloté par Ulysse, qui appelle directement les endpoints
// /api/v1/booking/** avec son jeton de service.
export const bookingApi = {
  placeOption: payload => apiRequest('/booking/booked_date/option', 'post', payload),
}
