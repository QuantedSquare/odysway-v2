export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.type === 'checkout.session.expired') {
    try {
      const updatedDeal = {
        deal: {
          fields: [
            { customFieldId: 20, fieldValue: 'Abandon du paiement Stripe' },
          ],
        },
      }
      activecampaign.updateDeal(body.data.object.metadata.dealId, updatedDeal)
      setResponseStatus(event, 200)
    }
    catch (err) {
      console.log('Error abandoned', err)
      throw createError({
        statusCode: 400,
        message: 'Error Abandon Stripe', err,
      })
    }
  }
})
