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

    const { error } = await supabase
      .from('activecampaign_clients')
      .delete()
      .eq('contact', contactId)

    if (error) {
      console.error('Supabase delete error:', error)
      throw createError({ statusCode: 500, message: 'Failed to delete contact' })
    }

    return { success: true, deletedContactId: contactId }
  }
  catch (err) {
    console.error('ContactDelete webhook error:', err)
    throw createError({ statusCode: 500, message: 'Unexpected error in contact delete process' })
  }
})
