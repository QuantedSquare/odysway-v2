// Garde deny-by-default du back-office.
//
// Tout ce qui vit sous /api/v1/booking et /api/v1/ac est interne — dates,
// réservations, marges, factures, CRM — SAUF les routes que le site public, le
// tunnel de commande et les webhooks appellent, listées ci-dessous. Une route
// ajoutée demain sous ces préfixes est donc fermée par défaut : l'ouvrir au
// public est un choix explicite, fait ici.
//
// Porteurs acceptés (requireCrmAccess) : jeton de service Ulysse, ou session
// Google @odysway.com. Seule dérogation : un serveur `nuxt dev` local. Un
// déploiement Vercel — preview comme production — exige l'authentification,
// ce qui permet d'exposer la preview sans le verrou Vercel.
//
// Les handlers gardent leur propre requireCrmAccess : il leur fournit
// l'utilisateur à journaliser, et tient si ce middleware venait à être
// contourné.

const PROTECTED_PREFIXES = ['/api/v1/booking/', '/api/v1/ac/']

// [méthodes, motif]. Le motif porte sur le chemin BRUT (sans query) : c'est
// celui que voit le routeur, un segment `[^/]+` y est donc exactement un
// paramètre de route.
const PUBLIC_ROUTES = [
  // Site public : dates, disponibilités, listings
  [['GET'], /^\/api\/v1\/booking\/travel-dates$/],
  [['GET'], /^\/api\/v1\/booking\/travels-by-date$/],
  [['GET'], /^\/api\/v1\/booking\/travelers-count$/],
  [['GET'], /^\/api\/v1\/booking\/last-minute-voyages$/],
  [['GET'], /^\/api\/v1\/booking\/[^/]+\/dates$/],
  [['GET'], /^\/api\/v1\/booking\/date\/[^/]+$/],

  // Tunnel de commande : le client s'identifie par son booked_id (uuid)
  [['GET'], /^\/api\/v1\/booking\/booking-exists$/],
  [['GET'], /^\/api\/v1\/booking\/purchase-data$/],
  [['POST'], /^\/api\/v1\/booking\/booked_date\/option$/],
  [['POST'], /^\/api\/v1\/booking\/[^/]+\/date\/[^/]+\/kickstart$/],
  [['POST'], /^\/api\/v1\/booking\/[^/]+\/date\/[^/]+\/assign-deal$/],
  [['POST'], /^\/api\/v1\/ac\/deals$/],
  [['GET'], /^\/api\/v1\/ac\/deals\/deal-from-bms$/],
  [['POST'], /^\/api\/v1\/ac\/deals\/update-with-bms$/],
  // Appelé sans session par kickstart (fire-and-forget) : le handler vérifie
  // que le couple dealId/bookedId correspond à une vraie réservation.
  [['POST'], /^\/api\/v1\/ac\/deals\/enrich$/],
  // Projection publique réduite (toPublicDeal) pour les anciens liens de paiement
  [['GET'], /^\/api\/v1\/ac\/deals\/[^/]+$/],

  // Webhooks et outils à jeton propre (?token=ACTIVECAMPAIGN_WEBHOOK_TOKEN)
  [['POST'], /^\/api\/v1\/ac\/webhooks\/[^/]+$/],
  [['POST'], /^\/api\/v1\/ac\/backfill$/],
]

const isProtected = path => PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix))

// Vue du chemin telle qu'un routeur tolérant pourrait la décoder. Ne sert qu'à
// décider si la garde s'applique — jamais à ouvrir une route.
const lenientPath = (path) => {
  try {
    return decodeURIComponent(path).replace(/\/{2,}/g, '/').toLowerCase()
  }
  catch {
    return null
  }
}

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0]
  const lenient = lenientPath(path)
  // Chemin indécodable : on garde, par prudence.
  if (!isProtected(path) && lenient !== null && !isProtected(lenient)) return

  const method = event.method === 'HEAD' ? 'GET' : event.method
  const isPublic = PUBLIC_ROUTES.some(([methods, pattern]) => methods.includes(method) && pattern.test(path))
  if (isPublic) return

  requireCrmAccess(event)
})
