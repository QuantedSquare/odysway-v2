import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
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
    // Precise origin: the exact failing field(s) from Zod, surfaced to the
    // client (and Slack) instead of a generic "validation failed".
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'ZOD_VALIDATION',
      step: 'details',
      origin: funnelReporter.zodToOrigin(parsedBody.error),
      message: `Validation du deal échouée — ${funnelReporter.zodIssuesSummary(parsedBody.error)}`,
    })
  }

  // Voyage en portage : le deal naît dans la pipeline 7, quel que soit le formulaire.
  const portageCreation = pipelines.creationPortage(parsedBody.data.stage, await portage.estVoyagePortage(parsedBody.data.slug))
  if (portageCreation) Object.assign(parsedBody.data, portageCreation)

  try {
    const t0 = Date.now()
    const response = await activecampaign.createDeal(parsedBody.data)
    console.log(`[create-deal] DONE dealId=${response} slug=${parsedBody.data.slug} in ${Date.now() - t0}ms`)
    // Le prospect vient de laisser son email : on fige d'où il vient.
    const ligneAttribution = await attributionDeal.enregistrer(event, response, parsedBody.data.source || 'Formulaire')
    await conversionsDeal.lead(event, response, ligneAttribution, parsedBody.data)
    return response
  }
  catch (err) {
    console.error('=======Deal creation error=======', err)
    throw funnelReporter.funnelCreateError({
      statusCode: 500,
      code: 'AC_CREATE_DEAL_FAILED',
      step: 'details',
      origin: { endpoint: '/ac/deals' },
      message: 'Échec de création du deal côté ActiveCampaign',
    })
  }
})
