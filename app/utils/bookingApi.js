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
  // params accepte { includeDeleted: true } pour alimenter la Corbeille.
  getDatesBySlug: (slug, params = {}) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/dates${encodeQuery(params)}`),
  getDateById: (dateId, params = {}) =>
    apiRequest(`/booking/date/${encodeURIComponent(dateId)}${encodeQuery(params)}`),
  updateDate: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}`, 'put', payload),
  deleteDate: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}`, 'delete'),
  duplicateDate: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/duplicate`, 'post'),
  getBooked: (slug, dateId, params = {}) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/booked${encodeQuery(params)}`),
  deleteBooked: (slug, dateId, bookedId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/booked/${encodeURIComponent(bookedId)}`, 'delete'),
  assignDeal: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-deal`, 'post', payload),
  assignDepartureDeal: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-departure-deal`, 'post', payload),
  removeDepartureDeal: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/assign-departure-deal`, 'delete'),
  addDate: payload => apiRequest('/booking/add-date', 'post', payload),

  // Restauration (soft delete) — voir supabase/migrations/20260801090000_soft_delete.sql
  restoreDate: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/restore`, 'post'),
  restoreBooked: (slug, dateId, bookedId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/booked/${encodeURIComponent(bookedId)}/restore`, 'post'),
  // resource: 'note' | 'attachment' | 'invoice'
  restoreChild: (slug, dateId, resource, id) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/restore-child`, 'post', { resource, id }),

  // Corbeille globale — type: 'all' | 'travel_dates' | 'booked_dates' | 'deals'
  getTrash: (params = {}) => apiRequest(`/booking/trash${encodeQuery(params)}`),
  restoreDeal: dealId =>
    apiRequest(`/booking/trash/deal/${encodeURIComponent(dealId)}/restore`, 'post'),

  // Duplicate an AC deal onto a test email (booking-management testing tool)
  duplicateDeal: (dealId, payload) =>
    apiRequest(`/ac/deals/${encodeURIComponent(dealId)}/duplicate`, 'post', payload),

  // Read-only dump of every field of an AC deal (booking-management inspector)
  inspectDeal: dealId => apiRequest(`/ac/deals/${encodeURIComponent(dealId)}/inspect`),

  // Notes
  getNotes: (slug, dateId, params = {}) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes${encodeQuery(params)}`),
  addNote: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes`, 'post', payload),
  deleteNote: (slug, dateId, noteId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/notes/${encodeURIComponent(noteId)}`, 'delete'),

  // Activity log
  getActivity: (slug, dateId, params) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/activity${encodeQuery(params)}`),

  // Attachments
  getAttachments: (slug, dateId, params = {}) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments${encodeQuery(params)}`),
  getUploadUrl: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/upload-url`, 'post', payload),
  deleteAttachment: (slug, dateId, attachmentId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/${encodeURIComponent(attachmentId)}`, 'delete'),
  getAttachmentDownloadUrl: (slug, dateId, attachmentId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/attachments/${encodeURIComponent(attachmentId)}/download`),

  // Funnel
  placeOption: payload => apiRequest('/booking/booked_date/option', 'post', payload),
  extendOption: payload => apiRequest('/booking/booked_date/extend-option', 'post', payload),
  bookingExists: bookedId =>
    apiRequest(`/booking/booking-exists${encodeQuery({ booked_id: bookedId })}`),

  // Margins — voyage-level PAX table (Pattern A), declined per year and per season
  // Status is year-scoped: pass the departure year being configured.
  getMarginsStatus: (year = null) =>
    apiRequest(`/booking/margins${encodeQuery(year ? { year } : {})}`),
  getMarginsDashboard: (params = {}) => apiRequest(`/booking/margins/dashboard${encodeQuery(params)}`),
  getMarginsDashboardVoyage: (slug, params = {}) =>
    apiRequest(`/booking/margins/dashboard/${encodeURIComponent(slug)}${encodeQuery(params)}`),
  // Returns { rows, seasons, settings } — everything the editor needs in one call.
  getVoyageMargin: (slug, year = null) =>
    apiRequest(`/booking/margins/${encodeURIComponent(slug)}${encodeQuery(year ? { year } : {})}`),
  // seasonId null targets the "toutes saisons" default rows.
  updateVoyageMargin: (slug, year, rows, seasonId = null) =>
    apiRequest(
      `/booking/margins/${encodeURIComponent(slug)}${encodeQuery(seasonId ? { year, season_id: seasonId } : { year })}`,
      'put',
      rows,
    ),
  // Removes the whole pax tier for the year — every season plus the default row.
  deleteVoyageMarginRow: (slug, pax, year) =>
    apiRequest(`/booking/margins/${encodeURIComponent(slug)}${encodeQuery({ pax, year })}`, 'delete'),
  // Removes a single cell. seasonId null targets the "toutes saisons" default row.
  deleteVoyageMarginCell: (slug, pax, year, seasonId = null) =>
    apiRequest(
      `/booking/margins/${encodeURIComponent(slug)}${encodeQuery(
        seasonId ? { pax, year, scope: 'cell', season_id: seasonId } : { pax, year, scope: 'cell' },
      )}`,
      'delete',
    ),
  // Recurring DD/MM seasons — replace-all, the payload is the complete list.
  updateVoyageMarginSeasons: (slug, seasons) =>
    apiRequest(`/booking/margins/${encodeURIComponent(slug)}/seasons`, 'put', seasons),
  updateVoyageMarginSettings: (slug, payload) =>
    apiRequest(`/booking/margins/${encodeURIComponent(slug)}/settings`, 'put', payload),

  // Margins — per-date computation + override (Pattern B)
  getDateMargin: (slug, dateId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/margin`),
  updateMarginOverride: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/margin-override`, 'put', payload),

  // Invoices (supplier purchase invoices per date)
  getInvoices: (slug, dateId, params = {}) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices${encodeQuery(params)}`),
  getInvoiceUploadUrl: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices/upload-url`, 'post', payload),
  createInvoiceWithoutFile: (slug, dateId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices`, 'post', payload),
  updateInvoice: (slug, dateId, invoiceId, payload) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices/${encodeURIComponent(invoiceId)}`, 'put', payload),
  deleteInvoice: (slug, dateId, invoiceId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices/${encodeURIComponent(invoiceId)}`, 'delete'),
  getInvoiceDownloadUrl: (slug, dateId, invoiceId) =>
    apiRequest(`/booking/${encodeURIComponent(slug)}/date/${encodeURIComponent(dateId)}/invoices/${encodeURIComponent(invoiceId)}/download`),
}
