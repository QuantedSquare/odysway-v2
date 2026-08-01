import axios from 'axios'

// Alertes Slack partagées.
//
// Il n'existait pas de helper général : huit blocs axios/$fetch ad hoc étaient
// dispersés dans stripe.js, alma.js, activecampaign.js, cronjob.js et les
// webhooks. Les deux « helpers » existants (activecampaign.optionNotification,
// funnelReporter.slackTransport) sont chacun liés à un webhook et à une forme de
// payload précise.
//
// Règles :
//   - no-op silencieux quand la variable d'env n'est pas définie (comme
//     funnelReporter), donc la fonctionnalité est inerte tant que le webhook
//     n'est pas configuré ;
//   - ne throw JAMAIS. Une panne Slack ne doit pas faire échouer un webhook de
//     paiement — c'est déjà le comportement de alma.js:28, on en fait la règle.

const isDev = process.env.NODE_ENV !== 'production'

const send = async (webhookUrl, text) => {
  if (!webhookUrl) return false
  if (isDev) {
    console.log('[slack:dev]', text)
    return false
  }
  try {
    await axios({
      url: webhookUrl,
      method: 'post',
      data: { blocks: [{ type: 'section', text: { type: 'mrkdwn', text } }] },
    })
    return true
  }
  catch (err) {
    console.error('[slack] send failed:', err.message)
    return false
  }
}

const siteUrl = () => (process.env.NUXT_PUBLIC_SITE_URL || 'https://odysway.com').replace(/\/$/, '')

/**
 * Un paiement est arrivé sur une réservation soft-deleted : on l'a ressuscitée.
 * Le paiement fait foi, mais l'équipe doit savoir que la réservation est
 * revenue — typiquement un deal marqué « Perdu » dont le client paie quand même.
 */
const alertPaymentOnDeletedBooking = ({
  dealId, bookedId, travelDateId, travelSlug,
  deletedAt, deletedBy, deletedReason, paymentType, provider,
}) => {
  const bms = travelSlug && travelDateId
    ? `\n<${siteUrl()}/booking-management/${travelSlug}/${travelDateId}|Ouvrir dans le BMS>`
    : ''
  return send(process.env.SLACK_URL_PAIEMENTS,
    `:warning: *Paiement sur une réservation supprimée — réservation réactivée*\n`
    + `• Deal : \`${dealId}\`  ·  booked_id : \`${bookedId}\`\n`
    + `• Paiement : ${provider} / ${paymentType}\n`
    + `• Avait été supprimée le ${deletedAt || '?'} par ${deletedBy || '?'} (raison : ${deletedReason || '?'})\n`
    + `La réservation a été remise en actif et les places recomptées.${bms}`)
}

/**
 * Un paiement a abouti sans qu'aucune ligne booked_dates ne corresponde au deal.
 * Trou préexistant : stripe.js et alma.js se contentaient d'un console.error, si
 * bien qu'un paiement pouvait être encaissé sans trace Supabase ni alerte.
 */
const alertOrphanPayment = ({ dealId, provider, paymentType, transactionId }) =>
  send(process.env.SLACK_URL_FUNNEL_ERRORS,
    `:rotating_light: *Paiement orphelin — aucune réservation en base*\n`
    + `• Deal : \`${dealId}\`\n`
    + `• Paiement : ${provider} / ${paymentType}  ·  transaction : \`${transactionId || '?'}\`\n`
    + `Aucune ligne booked_dates pour ce deal : l'argent est encaissé, la réservation est à recréer à la main.`)

/**
 * Une réservation active a été trouvée sous une date supprimée : la cascade de
 * suppression l'a manquée (échec en cours de route, cascade non transactionnelle).
 */
const alertCascadeLeak = ({ dealId, bookedId, travelDateId }) =>
  send(process.env.SLACK_URL_FUNNEL_ERRORS,
    `:broken_heart: *Fuite de cascade — réservation active sous une date supprimée*\n`
    + `• Deal : \`${dealId}\`  ·  booked_id : \`${bookedId}\`\n`
    + `• Date supprimée : \`${travelDateId}\`\n`
    + `La réservation a été déplacée vers la nouvelle date. Vérifier la cohérence de la date supprimée.`)

export default { send, alertPaymentOnDeletedBooking, alertOrphanPayment, alertCascadeLeak }
