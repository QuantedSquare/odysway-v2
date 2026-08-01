import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const { year } = getQuery(event)
  const yearNum = year ? Number(year) : null

  try {
    const rows = await margins.getMarginForVoyage(slug, yearNum)
    return rows
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
