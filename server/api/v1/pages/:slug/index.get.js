import page from './page.json'

export default defineEventHandler((event) => {
  console.log('event', event.context.params)
  const slug = event.context.params.slug
  console.log('slug', slug)
  try {
    if (!slug) {
      throw createError({
        statusCode: 404,
        message: 'No Page found',
      })
    }
    return {
      ...page,
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
