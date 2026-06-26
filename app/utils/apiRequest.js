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
    // Attach structured metadata so useFunnelReporter can report a precise
    // origin (endpoint + status) without each call site repeating it.
    try {
      error.__funnel = {
        endpoint,
        method,
        statusCode: error?.statusCode,
        data: error?.data,
      }
    }
    catch {
      // error may be a non-extensible value — ignore.
    }
    throw error
  }
}
