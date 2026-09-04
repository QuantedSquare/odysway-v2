// travel_dates carries two layers of numbers: the real ones the booking engine
// works with, and the `displayed_*` overrides the BMS uses to steer what a
// visitor sees (hide a co-filled group, make a date look fuller than it is...).
// Every public surface must read the displayed layer when `custom_display` is
// on, otherwise the homepage contradicts the voyage page — that is how a date
// marked "Complet" in the BMS ended up in the "Dernières places" carousel.

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Displayed value wins only when custom_display is on AND the override is set;
// a null override falls back to the real column.
const pickDisplayed = (date, displayedKey, realKey) => {
  const displayed = date?.custom_display ? toNumberOrNull(date?.[displayedKey]) : null
  return displayed === null ? toNumberOrNull(date?.[realKey]) : displayed
}

/**
 * Seat counts as the public site must show them.
 * `max`/`min` are null when the BMS never set a cap; `seatsLeft` is then null
 * too (unknown, not zero).
 */
export const resolveSeatCounts = (date) => {
  const max = pickDisplayed(date, 'displayed_max_travelers', 'max_travelers')
  const booked = pickDisplayed(date, 'displayed_booked_seat', 'booked_seat') ?? 0
  const min = pickDisplayed(date, 'displayed_min_travelers', 'min_travelers')
  return { max, booked, min, seatsLeft: max === null ? null : max - booked }
}

export const resolveStartingPrice = date =>
  pickDisplayed(date, 'displayed_starting_price', 'starting_price')

// The BMS status vocabulary is soon_confirmed | confirmed | guaranteed, where
// "guaranteed" is labelled "Garanti (Complet)" — i.e. sold out (see
// app/utils/bookingStatuses.js). 'full' is only kept for legacy rows.
const FULL_STATUSES = new Set(['guaranteed', 'full'])

// Mirrors app/utils/getDateStatus.js: displayed_status wins over status.
export const resolveDateStatus = date => date?.displayed_status || date?.status || null

/** A date nobody can book any more: flagged sold out, or no seat left. */
export const isDateFull = (date) => {
  if (FULL_STATUSES.has(resolveDateStatus(date))) return true
  const { seatsLeft } = resolveSeatCounts(date)
  return seatsLeft !== null && seatsLeft <= 0
}
