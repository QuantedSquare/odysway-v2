export function getDateStatus(date) {
  if (!date.custom_display) {
    if (date.max_travelers === date.booked_seat) {
      return {
        status: 'full',
        text: 'Complet',
        color: 'secondary',
      }
    }
    if (date.booked_seat >= date.min_travelers) {
      return {
        status: 'confirmed',
        text: 'Départ Garanti',
        color: 'green',
      }
    }
    else {
      return {
        status: 'soon_confirmed',
        text: 'Bientôt confirmé',
        color: 'yellow',
      }
    }
  }
  else {
    const displayedStatusObject = [
      {
        status: 'soon_confirmed',
        text: 'Bientôt confirmé',
        color: 'yellow',
      },
      {
        status: 'confirmed',
        text: 'Départ Garanti',
        color: 'green',
      },
      {
        status: 'full',
        text: 'Complet',
        color: 'secondary',
      },
    ]
    return displayedStatusObject.find(status => status.status === date.displayed_status)
  }
}
