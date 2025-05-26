import page from './page.json'

export default defineEventHandler((event) => {
  const slug = event.context.params.slug
  const foundPage = page.find(i => i.slug === slug)
  try {
    if (!slug) {
      throw createError({
        statusCode: 404,
        message: 'No Page found',
      })
    }
    return {
      ...foundPage.fields,
    }
  }
  catch (err) {
    console.log('Error getting one travel', err, page)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting one travel', err,
    })
  }
})
