export function getDateStatus(date) {
  console.log('date', date)
  if (date.displayed_status === 'soon_confirmed') {
    return {
      status: 'soon_confirmed',
      text: 'Bientôt confirmé',
      color: 'yellow',
    }
  }

  if (date.displayed_status === 'guaranteed' || date.max_travelers === date.booked_seat) {
    return {
      status: 'full',
      text: 'Complet',
      color: 'secondary',
    }
  }

  return {
    status: 'confirmed',
    text: 'Départ Garanti',
    color: 'green',
  }
}
