// Branchement des conversions serveur (conversions.js) sur le cycle du deal :
// le lead à la création, l'achat au premier paiement. Ne lève jamais : une
// conversion perdue ne doit faire échouer ni un devis ni un webhook de paiement.

import { getCookie, getHeader, getRequestIP } from 'h3'
import supabase from './supabase'
import conversions from './conversions'

// Adresses de test du tunnel (même liste que Details.vue et devis) : jamais envoyées.
const EMAILS_TEST = ['test@test.com', 'ottmann.alex@gmail.com']
const estUnTest = email => EMAILS_TEST.includes(conversions.normaliserEmail(email))

// Posé par le navigateur juste avant son propre événement de lead (useLeadSource).
const COOKIE_ID_LEAD = 'ody_leid'

/**
 * Lead : appelé par POST /ac/deals et kickstart, après attributionDeal.enregistrer.
 * `body` : le corps reçu (email, phone, firstname, lastname, isoContact, slug, title…).
 */
const lead = async (event, dealId, ligneAttribution, body = {}) => {
  try {
    if (!dealId || estUnTest(body.email)) return false
    if (!conversions.consentementDonne(ligneAttribution)) {
      console.log(`[conversions] generate_lead deal ${dealId} : pas de consentement, non envoyé`)
      return false
    }
    const evenement = conversions.evenementLead({
      dealId,
      eventId: getCookie(event, COOKIE_ID_LEAD),
      formulaire: ligneAttribution.formulaire,
      attribution: ligneAttribution,
      contact: body,
      voyage: { slug: body.slug, titre: body.title },
      requete: {
        ip: getRequestIP(event, { xForwardedFor: true }),
        userAgent: getHeader(event, 'user-agent'),
        pageLocation: getHeader(event, 'referer'),
      },
    })
    return await conversions.envoyer(evenement)
  }
  catch (err) {
    console.error(`[conversions] generate_lead deal ${dealId} : échec`, err?.message || err)
    return false
  }
}

/**
 * Achat : appelé par les webhooks Stripe et Alma, au PREMIER paiement seulement
 * (le navigateur n'envoie lui aussi son `purchase` qu'au premier paiement).
 * `deal` : le deal AC lu avant la mise à jour du paiement ; `contact` : le contact AC.
 */
const achat = async ({ dealId, transactionId, typePaiement, deal = {}, contact = {}, isoContact = null }) => {
  try {
    if (!dealId || estUnTest(contact.email)) return false
    const { data: ligneAttribution, error } = await supabase
      .from('deal_attribution')
      .select('*')
      .eq('deal_id', dealId)
      .maybeSingle()
    if (error) console.error(`[conversions] purchase deal ${dealId} : lecture de l'attribution`, error.message || error)
    // Sans ligne (deal créé hors du site) : pas de consentement connu, rien n'est envoyé.
    if (!conversions.consentementDonne(ligneAttribution)) {
      console.log(`[conversions] purchase deal ${dealId} : pas de consentement connu, non envoyé`)
      return false
    }
    const evenement = conversions.evenementAchat({
      dealId,
      contactId: deal.contact,
      transactionId,
      // Même valeur que le `purchase` du navigateur (purchase-data) : le prix total du voyage.
      valeurCentimes: deal.totalTravelPrice,
      attribution: ligneAttribution,
      contact: {
        email: contact.email,
        phone: contact.phone,
        firstname: contact.firstName,
        lastname: contact.lastName,
        isoContact,
      },
      voyage: { slug: deal.slug, titre: deal.title, nbVoyageurs: deal.nbTravelers },
      typePaiement,
    })
    return await conversions.envoyer(evenement)
  }
  catch (err) {
    console.error(`[conversions] purchase deal ${dealId} : échec`, err?.message || err)
    return false
  }
}

export default { lead, achat }
