export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('Chapka: quote back', body)
  chapka.quote(body).then((response) => {
    console.log('Chapka: quote', response)
    setResponseStatus(event, 200)
    return response
  })
    .catch((err) => {
      console.log('Error Chapka quote', err)
      throw createError({
        statusCode: 500,
        message: 'Error Chapka quote', err,
      })
    })
})
