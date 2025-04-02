export const useSecureUrl = () => {
  const loading = ref(false)
  const error = ref(null)
  const secureUrl = ref(null)
  const config = useRuntimeConfig()
  const baseURL = config.public.siteURL || ''

  const generateSecureUrl = async (params, secureParams = []) => {
    try {
      // Separate secure and non-secure parameters
      const secureData = {}
      const nonSecureData = {}
      
      Object.keys(params).forEach(key => {
        if (secureParams.includes(key)) {
          secureData[key] = params[key]
        } else {
          nonSecureData[key] = params[key]
        }
      })

      // Only encrypt the secure parameters
      const response = await fetch(`${baseURL}/api/v1/generate_secure_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params: secureData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Construct URL with encrypted secure params and non-secure params
      const queryParams = new URLSearchParams()
      
      // Add encrypted secure params
      if (data.params) {
        queryParams.append('secure', data.params)
      }
      
      // Add non-secure params directly
      Object.entries(nonSecureData).forEach(([key, value]) => {
        queryParams.append(key, value)
      })

      const url = `/checkout?${queryParams.toString()}`

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
      // Decode the URL-encoded token
      const decodedToken = decodeURIComponent(token)

      const response = await fetch(`${baseURL}/api/v1/validate_secure_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: decodedToken,
          nonSecureParams: {}
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Validation failed with status: ${response.status}`)
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
