// État partagé de la modale Cal.com de la variante B : tous les CTA « Prendre
// rendez-vous » de la page l'ouvrent, avec leur emplacement (pour la mesure) et,
// pour un créneau cliqué, l'heure à présélectionner.

import { AB_TEST_NAME } from '~/utils/rdvVariant'

export function useRdvBooking() {
  const dialog = useState('rdv-booking-dialog', () => ({ open: false, position: null, slot: null }))
  const { trackAbEvent, trackRdvClick } = useGtmTracking()

  function openRdv(position, slot = null) {
    trackAbEvent('cta_rdv_click', { ab_test: AB_TEST_NAME, position, ...(slot && { slot }) })
    trackRdvClick(`voyage-ab-rdv-${position}`)
    dialog.value = { open: true, position, slot }
  }

  function closeRdv() {
    dialog.value = { ...dialog.value, open: false }
  }

  return { dialog, openRdv, closeRdv }
}
