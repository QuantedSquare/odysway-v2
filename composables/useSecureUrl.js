export const useSecureUrl = () => {
  const loading = ref(false)
  const error = ref(null)
  const secureUrl = ref(null)
  const generateSecureUrl = async (params) => {
    try {
      const response = await fetch('/api/v1/generate_secure_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Construct URL with encrypted params as query parameter
      const url = `/checkout?params=${data.params}`

      return url
    }
    catch (error) {
      console.error('Error in generateSecureUrl:', error)
      return '#'
    }
  }

  const validateSecureUrl = async (token) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/v1/validate_secure_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error(`Validation failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.payload) {
        throw new Error('Invalid token or no data returned')
      }

      return data.payload
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    secureUrl,
    generateSecureUrl,
    validateSecureUrl,
  }
}
