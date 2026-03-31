import apiRequest from '~/utils/apiRequest'

function encodeQuery(params = {}) {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .flatMap(([k, v]) => {
      if (Array.isArray(v)) return v.map(item => [k, item])
      return [[k, v]]
    })

  if (!entries.length) return ''
  return `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')}`
}

export function getApiErrorMessage(err, fallback = 'Erreur inattendue.') {
  return (
    err?.data?.statusMessage
    || err?.data?.message
    || err?.statusMessage
    || err?.message
    || fallback
  )
}

export const bookingApi = {
  // Public-ish data
  getTravels: () => apiRequest('/booking/travels'),
  getTravelsByDate: () => apiRequest('/booking/travels-by-date'),
  getTravelDates: (slugs = []) =>
    apiRequest(`/booking/travel-dates${encodeQuery({ slugs: Array.isArray(slugs) ? slugs.join(',') : slugs })}`),

  // Backoffice (booking-management)
  getAllDates: () => apiRequest('/booking/all-dates'),
  getDatesBySlug: slug => apiRequest(`/booking/${encodeURIComponent(slug)}/dates`),
  getDateById: dateId => apiRequest(`/booking/date/${encodeURIComponent(dateId)}`),
  updateDate: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}`, 'put', payload),
  deleteDate: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}`, 'delete'),
  duplicateDate: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/duplicate`, 'post'),
  getBooked: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/booked`),
  deleteBooked: (slug, dateId, bookedId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/booked/${encodeURIComponent(bookedId)}`, 'delete'),
  assignDeal: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-deal`, 'post', payload),
  assignDepartureDeal: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-departure-deal`, 'post', payload),
  removeDepartureDeal: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-departure-deal`, 'delete'),
  addDate: payload => apiRequest('/booking/add-date', 'post', payload),

  // Notes
  getNotes: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes`),
  addNote: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes`, 'post', payload),
  deleteNote: (slug, dateId, noteId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes/${encodeURIComponent(noteId)}`, 'delete'),

  // Activity log
  getActivity: (slug, dateId, params) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/activity${encodeQuery(params)}`),

  // Attachments
  getAttachments: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments`),
  getUploadUrl: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/upload-url`, 'post', payload),
  deleteAttachment: (slug, dateId, attachmentId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/${encodeURIComponent(attachmentId)}`, 'delete'),
  getAttachmentDownloadUrl: (slug, dateId, attachmentId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/${encodeURIComponent(attachmentId)}/download`),

  // Funnel
  placeOption: payload => apiRequest('/booking/booked_date/option', 'post', payload),
  bookingExists: bookedId =>
    apiRequest(`/booking/booking-exists${encodeQuery({ booked_id: bookedId })}`),
}
