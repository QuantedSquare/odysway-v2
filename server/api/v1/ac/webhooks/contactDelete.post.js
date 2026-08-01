import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  try {
    const body = await readBody(event)
    console.log('Contact delete webhook received', body)

    const contactId = body['contact[id]']
    if (!contactId) {
      throw createError({ statusCode: 400, message: 'Missing contact id' })
    }

    // Soft delete : les vues du dashboard joignent activecampaign_clients pour
    // afficher le nom du client sur des réservations historiques. Effacer la
    // ligne blanchissait rétroactivement ces lignes.
    const removed = await softDelete.remove('activecampaign_clients', q => q.eq('contact', contactId), {
      user: { email: 'activecampaign' },
      reason: softDelete.REASONS.AC_CONTACT_DELETED,
    })

    if (removed.error) {
      throw createError({ statusCode: 500, message: 'Failed to soft delete contact' })
    }

    return { success: true, deletedContactId: contactId }
  }
  catch (err) {
    console.error('ContactDelete webhook error:', err)
    throw createError({ statusCode: 500, message: 'Unexpected error in contact delete process' })
  }
})
