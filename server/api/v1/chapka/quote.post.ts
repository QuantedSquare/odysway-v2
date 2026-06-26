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
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'INSURANCE_ZOD_VALIDATION',
      step: 'insurances',
      origin: funnelReporter.zodToOrigin(parsedBody.error),
      message: `Validation du devis assurance échouée — ${funnelReporter.zodIssuesSummary(parsedBody.error)}`,
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
    throw funnelReporter.funnelCreateError({
      statusCode: 500,
      code: 'CHAPKA_QUOTE_FAILED',
      step: 'insurances',
      origin: { endpoint: '/chapka/quote' },
      message: 'Erreur lors de l\'appel Chapka (devis assurance)',
    })
  }
})
