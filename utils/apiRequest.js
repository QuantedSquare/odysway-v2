export default async function (endpoint, method = 'get', body = null) {
  try {
    const response = await $fetch(`/api/v1${endpoint}`, {
      method,
      body,
    })
    console.log(`API Response from /api/v1${endpoint}:`, response)
    return response
  }
  catch (error) {
    console.error(`API Error in ${endpoint}:`, error)
    throw error
  }
}
