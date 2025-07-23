import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeInsuranceQuote> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }
  const parsedBody = await readValidatedBody(event, body => InsuranceSchema.safeParse(body))
  if (!parsedBody.success) {
    console.log('Chapka: quote parsed body', parsedBody)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }
  console.log('Chapka: quote parsed body', parsedBody.data)
  try {
    const result = await chapka.quote(parsedBody.data)
    console.log('Chapka: quote returned', result)
    return {
      ...result,
    }
  }
  catch (err) {
    console.log('Error Chapka quote', err)
    throw createError({
      statusCode: 500,
      message: 'Error Chapka quote',
    })
  }
})
