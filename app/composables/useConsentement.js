// Choix de la bannière cookies (« granted » / « denied »). Tant qu'il n'est pas
// donné, rien n'est consenti.
//
// Une seule source : le cookie `ody_consent` (13 mois), lu
// - par le serveur au moment du lead (server/utils/attribution.js) : les
//   conversions serveur ne partent que s'il vaut « granted » ;
// - par GTM (balise « GCM - Default », déclencheur Consent Initialization) pour
//   l'état de Consent Mode au chargement de chaque page.
// Un clic sur la bannière pousse en plus `ody_consent_update` dans le dataLayer,
// qui déclenche « GCM - Update » : le choix s'applique sans recharger la page.
// Configuration du container : docs/tracking-acquisition.md.
const CHOIX = ['granted', 'denied']

export const useConsentement = () => {
  const choix = useState('consentement-choix', () => null)
  const bandeauOuvert = useState('consentement-bandeau', () => false)
  const cookie = useCookie('ody_consent', { maxAge: 60 * 60 * 24 * 395, sameSite: 'lax', path: '/' })

  // Au montage de l'app. Le localStorage `consent` de l'ancienne bannière
  // (démontée depuis avril 2026, texte « en poursuivant votre navigation ») n'est
  // volontairement pas repris : ces choix ont plus de six mois, on redemande.
  const restaurer = () => {
    choix.value = CHOIX.includes(cookie.value) ? cookie.value : null
    bandeauOuvert.value = !choix.value
  }

  const enregistrer = (valeur) => {
    choix.value = valeur
    bandeauOuvert.value = false
    cookie.value = valeur
    // Salariés (cookie odysway_employee_optout) : rien dans le dataLayer, comme
    // pour les autres événements (useGtmTracking).
    if (String(useCookie('odysway_employee_optout').value) === '1') {
      return
    }
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'ody_consent_update', ody_consent: valeur })
  }

  const ouvrirBandeau = () => {
    bandeauOuvert.value = true
  }

  return { choix, bandeauOuvert, restaurer, enregistrer, ouvrirBandeau }
}
