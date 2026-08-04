import { defineEventHandler, getQuery } from 'h3'

// Liste les deals dont le lien de paiement est mort : plus aucune ligne
// booked_dates ne les rattache à une date de départ. Voir server/utils/brokenLinks.js.
//
// Protégé par server/middleware/bms-auth.js : tout /api/v1/booking/** est privé
// par défaut, ce endpoint n'a donc pas à refaire le contrôle.
export default defineEventHandler(async (event) => {
  const { futureOnly, verifyAc, verifyLimit } = getQuery(event)

  return await brokenLinks.listBrokenLinks({
    futureOnly: futureOnly !== 'false',
    // Lecture du champ « lien de paiement » dans AC : un appel par deal, donc
    // sur demande explicite et borné.
    verifyAc: verifyAc === 'true',
    verifyLimit: Math.min(Number(verifyLimit) || 40, 100),
  })
})
