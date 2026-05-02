export default defineEventHandler(async (event) => {
  const session = await readBody(event)
  try {
    if (session.bookedId) {
      const { data } = await supabase
        .from('booked_dates')
        .select('deal_id')
        .eq('id', session.bookedId)
        .single()
      session.dealId = data?.deal_id
    }
    activecampaign.optionNotification(session)
  }
  catch (err) {
    console.log('Error slack notification', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending slack notification', err,
    })
  }
})
