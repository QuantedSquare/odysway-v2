// Projection publique d'un deal ActiveCampaign.
//
// POURQUOI — les identifiants de deal AC sont des entiers séquentiels. Toute
// route adressée par `dealId` et ouverte à l'anonyme est donc un oracle
// d'énumération : il suffit de parcourir 1..N. Le payload CRM complet contient
// l'identité du client (email, téléphone), le coût d'achat agence, les marges,
// les commissions d'assurance et les montants déjà payés — rien de tout cela ne
// doit sortir sans session.
//
// Le seul appelant anonyme légitime est la redirection des anciens liens de
// paiement (`/paiement?orderId=<dealId>`, voir
// app/middleware/oldPayementLinkRedirection.js) : elle a besoin de retrouver ou
// de créer la date de départ correspondante. Elle ne lit que les champs
// ci-dessous — assez pour situer le voyage, jamais assez pour profiler un
// client ou reconstituer une marge.
//
// Toute nouvelle clé ajoutée ici est publiée à l'internet entier pour TOUS les
// deals : n'en ajouter qu'après s'être demandé ce qu'un tiers en ferait en
// balayant la totalité du CRM.

export const PUBLIC_DEAL_FIELDS = Object.freeze([
  'id',
  'slug',
  'departureDate',
  'returnDate',
  'basePricePerTraveler',
  'flightPrice',
  'includeFlight',
  'gotEarlybird',
  'gotLastMinute',
])

/**
 * Réduit un deal fusionné (champs natifs AC + champs personnalisés mappés) à la
 * projection publique. Les clés absentes du deal source ne sont pas inventées :
 * l'objet renvoyé ne contient que ce qui existait réellement.
 *
 * @param {object|null|undefined} deal
 * @returns {object} un nouvel objet, jamais une référence au deal source
 */
export const toPublicDeal = (deal) => {
  if (!deal || typeof deal !== 'object') return {}
  return PUBLIC_DEAL_FIELDS.reduce((acc, key) => {
    if (key in deal) acc[key] = deal[key]
    return acc
  }, {})
}
