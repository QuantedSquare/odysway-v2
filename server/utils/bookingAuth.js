const defaultSuperadmins = ['ottmann.alex@gmail.com']

// Google rejects the code exchange unless the callback sends back the exact
// redirect_uri the authorize step used, so both endpoints must resolve it here.
// Deployed environments each supply their own GOOGLE_REDIRECT_URI; it has to be
// registered in the Google OAuth console for that environment's domain.
export const getGoogleRedirectUri = () =>
  (import.meta.dev
    ? 'http://localhost:3000/api/v1/auth/google/callback'
    : process.env.GOOGLE_REDIRECT_URI)

export const getSuperadmins = () => {
  const fromEnv = (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)

  const merged = new Set([...defaultSuperadmins, ...fromEnv])
  return Array.from(merged)
}

export const isAllowedEmail = (email) => {
  if (!email) {
    return false
  }
  const normalized = email.toLowerCase()
  return normalized.endsWith('@odysway.com') || getSuperadmins().includes(normalized)
}
