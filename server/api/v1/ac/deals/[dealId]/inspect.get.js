// Read-only inspector for a single ActiveCampaign deal.
//
// Powers /booking-management/deal-inspector: pasting an AC deal URL
// (https://odysway90522.activehosted.com/app/deals/16447) returns every field
// AC stores on that deal — native columns AND all custom fields, including the
// ones absent from `customFieldsMapDeal`.
//
// SECURITY — this endpoint exposes raw CRM data (client identity, prices,
// margins, agent costs). It is internal-only:
//  - a valid `booking_token` session cookie is required (`requireBookingUser`),
//    which enforces a signed JWT + an @odysway.com / superadmin email;
//  - the only bypass is a local dev server (NODE_ENV !== 'production'), which
//    mirrors the `booking-management` route middleware. Vercel builds preview
//    AND production with NODE_ENV=production, so deployed environments always
//    require the session;
//  - responses are marked `no-store` so no CDN/proxy retains CRM payloads.

const isLocalDev = () => process.env.NODE_ENV !== 'production'

// AC returns multi-select values either as an array or as a `||a||b||` string.
const normalizeValue = (fieldValue) => {
  if (fieldValue === undefined || fieldValue === null) return null
  if (Array.isArray(fieldValue)) return fieldValue.join(', ')
  const value = String(fieldValue)
  if (value.includes('||')) {
    return value.split('||').filter(Boolean).join(', ')
  }
  return value
}

const findById = (collection, key, id) =>
  (collection?.[key] || []).find(entry => String(entry.id) === String(id)) || null

export default defineEventHandler(async (event) => {
  if (!isLocalDev()) {
    requireBookingUser(event)
  }

  // CRM payload: never cached anywhere.
  setResponseHeaders(event, {
    'cache-control': 'no-store, no-cache, must-revalidate, private',
    'pragma': 'no-cache',
  })

  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  }

  let deal
  try {
    const response = await activecampaign.getDealById(dealId)
    deal = response?.deal
  }
  catch (err) {
    if (err?.response?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    }
    console.error('[ac/deals/inspect] getDealById failed', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }

  if (!deal) {
    throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
  }

  // Everything below is enrichment: a failure must not hide the deal itself.
  const [rawFields, fieldMeta, contact, pipelines, stages, owners] = await Promise.allSettled([
    activecampaign.getDealRawCustomFieldData(dealId),
    activecampaign.getDealCustomFieldMeta(),
    deal.contact ? activecampaign.getClientById(deal.contact) : Promise.resolve(null),
    activecampaign.listPipelines(),
    activecampaign.listStages(),
    activecampaign.listUsers(),
  ]).then(results => results.map(result => (result.status === 'fulfilled' ? result.value : null)))

  const metaById = new Map((fieldMeta || []).map(field => [String(field.id), field]))
  const keyById = activecampaign.dealCustomFieldsMap || {}

  const customFields = (rawFields || [])
    .map((row) => {
      const meta = metaById.get(String(row.customFieldId))
      const value = normalizeValue(row.fieldValue)
      return {
        customFieldId: Number(row.customFieldId),
        label: meta?.fieldLabel || `Champ #${row.customFieldId}`,
        internalKey: keyById[row.customFieldId] || null,
        type: meta?.fieldType || null,
        value,
        isEmpty: value === null || value === '',
      }
    })
    .sort((a, b) => a.customFieldId - b.customFieldId)

  // Same shape the rest of the codebase consumes (activecampaign.getDealCustomFields),
  // handy to copy/paste into a payload while debugging.
  const mappedFields = customFields.reduce((acc, field) => {
    if (field.internalKey) {
      acc[field.internalKey] = field.value
    }
    return acc
  }, {})

  const pipeline = findById(pipelines, 'dealGroups', deal.group)
  const stage = findById(stages, 'dealStages', deal.stage)
  const ownerUser = findById(owners, 'users', deal.owner)

  return {
    dealId,
    fetchedAt: new Date().toISOString(),
    acUrl: `${(process.env.ACTIVE_CAMPAIGN_URL || '').replace(/\/api\/3\/?$/, '')}/app/deals/${dealId}`,
    deal,
    resolved: {
      pipelineId: deal.group ? Number(deal.group) : null,
      pipelineTitle: pipeline?.title || null,
      stageId: deal.stage ? Number(deal.stage) : null,
      stageTitle: stage?.title || null,
      ownerId: deal.owner ? Number(deal.owner) : null,
      ownerName: ownerUser ? `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim() : null,
      ownerEmail: ownerUser?.email || null,
    },
    contact: contact?.contact
      ? {
          id: Number(contact.contact.id),
          email: contact.contact.email,
          firstName: contact.contact.firstName,
          lastName: contact.contact.lastName,
          phone: contact.contact.phone,
        }
      : null,
    customFields,
    mappedFields,
  }
})
