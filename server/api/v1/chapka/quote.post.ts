import type { H3Event } from 'h3'
import chapka from '~/server/utils/chapka'
import { InsuranceSchema, type TypeInsuranceQuote } from '~/server/utils/types/insurance'

export default defineEventHandler(async (event: H3Event): Promise<TypeInsuranceQuote> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }
  const parsedBody = await readValidatedBody(event, body => InsuranceSchema.safeParse(body))
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }
  try {
    const result = await chapka.quote(parsedBody.data)
    return {
      ...result,
    }
  }
  catch (err) {
    console.error('Error Chapka quote:', err)
    throw createError({
      statusCode: 500,
      message: 'Error Chapka quote',
    })
  }
})
