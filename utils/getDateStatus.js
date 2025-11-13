// Status configuration mapping
const STATUS_MAP = {
  soon_confirmed: {
    status: 'soon_confirmed',
    text: 'Bientôt confirmé',
    color: 'yellow',
  },
  confirmed: {
    status: 'confirmed',
    text: 'Départ Garanti',
    color: 'green',
  },
  guaranteed: {
    status: 'full',
    text: 'Complet',
    color: 'secondary',
  },
}

/**
 * Calculates the status based on booking data
 * @param {Object} date - The date object containing booking information
 * @returns {Object} Status object with status, text, and color properties
 */
function calculateStatusFromBookings(date) {
  if (date.max_travelers === date.booked_seat) {
    // console.log('STATUS_MAP.full', STATUS_MAP.full, 'on date', date.departure_date)
    return STATUS_MAP.guaranteed
  }

  else if (date.booked_seat >= date.min_travelers) {
    return STATUS_MAP.confirmed
  }
  else {
    return STATUS_MAP.soon_confirmed
  }
}

/**
 * Gets the display status for a date based on custom display settings or booking data
 * @param {Object} date - The date object
 * @returns {Object} Status object with status, text, and color properties
 */
export function getDateStatus(date) {
  // If custom display is enabled and a valid status is provided, use it
  if (date.custom_display && date.displayed_status && STATUS_MAP[date.displayed_status]) {
    return STATUS_MAP[date.displayed_status]
  }
  // Otherwise, calculate status based on bookings
  return calculateStatusFromBookings(date)
}
