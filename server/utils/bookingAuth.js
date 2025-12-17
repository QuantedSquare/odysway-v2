const defaultSuperadmins = ['ottmann.alex@gmail.com']

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
