export default async function (endpoint, method = 'get', body = null) {
  try {
    const response = await $fetch(`/api/v1${endpoint}`, {
      method,
      body,
    })
    return response
  }
  catch (error) {
    console.error(`API Error in ${endpoint}:`, error)
    throw error
  }
}
