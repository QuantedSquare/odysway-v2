import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.NUXT_URL_HASH_SECRET || 'your-secret-key'

interface PaymentParams {
  dealId?: string
  slug?: string
  dateStart?: string
  dateEnd?: string
  plan?: string
  amount?: string
  type?: 'deposit' | 'balance' | 'full' | 'custom'
}

export const hashPaymentParams = (params: PaymentParams): string => {
  // Remove undefined values and empty strings
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== ''),
  )

  // Convert to string
  const paramsString = JSON.stringify(cleanParams)

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(paramsString, SECRET_KEY).toString()

  // Make URL safe
  return encodeURIComponent(encrypted)
}

export const decryptPaymentParams = (hash: string): PaymentParams | null => {
  try {
    // Decode URL safe string
    const decoded = decodeURIComponent(hash)

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(decoded, SECRET_KEY)

    // Convert to object
    const paramsString = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(paramsString)
  }
  catch (error) {
    console.error('Failed to decrypt payment params:', error)
    return null
  }
}
