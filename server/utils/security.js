import crypto from 'crypto'

export function generateSecureToken(payload) {
  try {
    const secret = useRuntimeConfig().urlHashSecret

    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    const tokenData = { payload, signature }
    // Properly encode to base64
    return Buffer.from(JSON.stringify(tokenData)).toString('base64')
  }
  catch (error) {
    console.error('Token generation error:', error)
    return null
  }
}

export function verifyToken(token) {
  try {
    const secret = useRuntimeConfig().urlHashSecret
    console.log('Verifying token:', token)

    // Properly decode from base64
    const decodedString = Buffer.from(token, 'base64').toString('utf-8')
    console.log('Decoded string:', decodedString)

    const decoded = JSON.parse(decodedString)
    console.log('Parsed token:', decoded)

    if (!decoded || !decoded.payload || !decoded.signature) {
      console.error('Invalid token structure')
      return null
    }

    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(decoded.payload))
      .digest('hex')

    const isValid = computedSignature === decoded.signature
    console.log('Signature match:', isValid)

    return isValid ? decoded.payload : null
  }
  catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
