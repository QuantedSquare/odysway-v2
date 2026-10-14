// Conversions envoyées par le serveur au container GTM server-side (Stape).
//
// Deux événements, qui ne dépendent plus du navigateur :
//   - `generate_lead` : le prospect laisse son email (création du deal AC) ;
//   - `purchase`     : premier paiement (webhook Stripe ou Alma), même si le
//                      client ne revient jamais sur la page de confirmation.
// Chacun porte les identifiants figés dans `deal_attribution` (gclid, fbc, fbp,
// client_id GA4) et les coordonnées du client : les tags du container (Meta
// Conversions API, Google Ads, GA4) les hachent selon les règles de chaque régie.
// Les envoyer en clair à NOTRE container (sst.odysway.com, HTTPS) est l'usage
// prévu par Stape ; ils ne sont jamais stockés ici.
//
// Déduplication avec le navigateur : `event_id` identique des deux côtés
// (`purchase_<dealId>` ; pour le lead, l'id que le navigateur a posé dans le
// cookie `ody_leid` juste avant d'envoyer son propre événement). Google Ads
// déduplique l'achat par `transaction_id`, identique lui aussi.
//
// Envoi : POST JSON vers STAPE_SERVER_URL + STAPE_DATA_PATH (Data Client Stape,
// « /data » par défaut), avec l'en-tête `x-ody-secret` = STAPE_SECRET que les
// déclencheurs du container exigent. Sans STAPE_SERVER_URL, rien n'est envoyé : ne la définir
// que sur l'environnement Production de Vercel.
//
// Construction pure (testée par tests/unit/conversions.test.mjs) ; `envoyer`
// n'utilise que fetch et process.env. Ne lève jamais.

import { createHash } from 'node:crypto'

const sha256 = valeur => createHash('sha256').update(valeur).digest('hex')

const normaliserEmail = email => String(email || '').trim().toLowerCase() || null

// Téléphone au format E.164 (« +33612345678 »). Numéro français sans indicatif
// (« 06 12 34 56 78 ») : +33. Illisible : null.
const normaliserTelephone = (telephone) => {
  const brut = String(telephone || '').trim()
  if (!brut) return null
  let chiffres = brut.replace(/\D/g, '')
  if (brut.startsWith('+')) return chiffres.length >= 8 ? `+${chiffres}` : null
  if (chiffres.startsWith('00')) chiffres = chiffres.slice(2)
  else if (chiffres.length === 10 && chiffres.startsWith('0')) chiffres = `33${chiffres.slice(1)}`
  return chiffres.length >= 8 ? `+${chiffres}` : null
}

// Retire récursivement null, undefined, chaînes vides et objets vides.
const compacter = (valeur) => {
  if (Array.isArray(valeur)) return valeur.map(compacter)
  if (valeur && typeof valeur === 'object') {
    const sortie = {}
    for (const [cle, v] of Object.entries(valeur)) {
      const c = compacter(v)
      const vide = c === null || c === undefined || c === ''
        || (typeof c === 'object' && !Array.isArray(c) && Object.keys(c).length === 0)
      if (!vide) sortie[cle] = c
    }
    return sortie
  }
  return valeur
}

const donneesUtilisateur = (contact = {}) => {
  const email = normaliserEmail(contact.email)
  return {
    email_address: email,
    sha256_email_address: email ? sha256(email) : null,
    phone_number: normaliserTelephone(contact.phone),
    address: {
      first_name: contact.firstname?.trim() || null,
      last_name: contact.lastname?.trim() || null,
      country: contact.isoContact?.trim().toUpperCase() || null,
    },
  }
}

// Identifiants publicitaires et attribution interne, depuis une ligne deal_attribution.
const donneesAttribution = (a = {}) => ({
  gclid: a.gclid,
  gbraid: a.gbraid,
  wbraid: a.wbraid,
  fbc: a.fbc,
  fbp: a.fbp,
  // Noms lus par le tag Meta Conversions API de Stape.
  ...{ 'x-fb-ck-fbc': a.fbc, 'x-fb-ck-fbp': a.fbp },
  first_channel: a.first_channel,
  first_source: a.first_source,
  first_campaign: a.first_campaign,
  last_channel: a.last_channel,
  last_source: a.last_source,
  last_campaign: a.last_campaign,
})

// GA4 exige un client_id : celui du navigateur s'il est connu, sinon un id stable
// propre au deal (la conversion compte, sans être rattachée à une session).
const clientId = (attribution, dealId) => attribution?.ga_client_id || `ody.${dealId}`

/** Seuls les visiteurs qui ont accepté les cookies partent vers les régies. */
const consentementDonne = attribution => attribution?.consent_ads === 'granted'

const evenementLead = ({ dealId, eventId, formulaire, attribution, contact, voyage = {}, requete = {} }) => compacter({
  event_name: 'generate_lead',
  event_id: eventId || `lead_${dealId}`,
  event_source: 'server',
  client_id: clientId(attribution, dealId),
  page_location: requete.pageLocation,
  ip_override: requete.ip,
  user_agent: requete.userAgent,
  currency: 'EUR',
  value: Number.isFinite(voyage.valeur) ? voyage.valeur : null,
  items: voyage.slug ? [{ item_id: voyage.slug, item_name: voyage.titre }] : null,
  user_data: donneesUtilisateur(contact),
  deal_id: String(dealId),
  formulaire,
  ...donneesAttribution(attribution),
})

const evenementAchat = ({ dealId, contactId, transactionId, valeurCentimes, attribution, contact, voyage = {}, typePaiement }) => compacter({
  event_name: 'purchase',
  event_id: `purchase_${dealId}`,
  event_source: 'server',
  client_id: clientId(attribution, dealId),
  user_id: contactId ? String(contactId) : null,
  currency: 'EUR',
  value: Math.round(Number(valeurCentimes) || 0) / 100,
  transaction_id: String(transactionId || dealId),
  payment_type: typePaiement,
  items: voyage.slug
    ? [{ item_id: voyage.slug, item_name: voyage.titre, quantity: Number(voyage.nbVoyageurs) || 1 }]
    : null,
  // Le navigateur du lead : sans eux, le Data Client prendrait l'IP et le
  // user agent du webhook de paiement (un serveur Vercel), que Meta lirait
  // comme ceux du client.
  ip_override: attribution?.client_ip,
  user_agent: attribution?.client_user_agent,
  user_data: donneesUtilisateur(contact),
  deal_id: String(dealId),
  ...donneesAttribution(attribution),
})

const envoyer = async (evenement) => {
  const base = process.env.STAPE_SERVER_URL
  if (!base) {
    console.log(`[conversions] ${evenement.event_name} deal ${evenement.deal_id} : STAPE_SERVER_URL absente, non envoyé`)
    return false
  }
  try {
    const url = new URL(process.env.STAPE_DATA_PATH || '/data', base)
    const reponse = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Secret partagé avec les déclencheurs du container : /data est public,
        // seul ce serveur doit pouvoir y déclarer un lead ou un achat.
        ...(process.env.STAPE_SECRET && { 'x-ody-secret': process.env.STAPE_SECRET }),
      },
      body: JSON.stringify(evenement),
      signal: AbortSignal.timeout(4000),
    })
    if (!reponse.ok) {
      console.error(`[conversions] ${evenement.event_name} deal ${evenement.deal_id} : Stape a répondu ${reponse.status}`)
      return false
    }
    console.log(`[conversions] ${evenement.event_name} deal ${evenement.deal_id} envoyé (${evenement.event_id})`)
    return true
  }
  catch (err) {
    console.error(`[conversions] ${evenement.event_name} deal ${evenement.deal_id} : échec`, err?.message || err)
    return false
  }
}

export default {
  normaliserEmail,
  normaliserTelephone,
  consentementDonne,
  evenementLead,
  evenementAchat,
  envoyer,
}
