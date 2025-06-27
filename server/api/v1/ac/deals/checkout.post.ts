import type { H3Event } from 'h3'
// This route differs from the deals/index.post.ts route because it is used to create a deal for a checkout
// Providing a booking id to the front
// and it is used to update the deal with a paiementLink afterward

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  const date_id = event.context.params?.date_id
  console.log('date_id', date_id)
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const parsedBody = await readValidatedBody(event, body => DealSchema.safeParse(body))
  if (!parsedBody.success) {
    console.error('Deal creation validation error:', parsedBody.error)
    console.log('error on', parsedBody.data)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }

  try {
    const response = await activecampaign.createDeal(parsedBody.data)

    const addedBookedDate = await $fetch(`/booking/${parsedBody.data.slug}/date/${date_id}/assign-deal`, {
      method: 'POST',
      body: {
        dealId: response,
        booked_places: 0, // this value is update after a payment
      },
    })

    return addedBookedDate as string
  }
  catch (err) {
    console.error('Deal creation error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create deal',
    })
  }
})
