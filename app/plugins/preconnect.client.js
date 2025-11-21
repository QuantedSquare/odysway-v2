/**
 * Preconnect Hints Plugin
 * Ensures preconnect hints are added to the document head
 * This helps establish early connections to critical domains
 */
export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  // Critical domains that need preconnect
  const preconnectDomains = [
    { href: 'https://nu6yntji.apicdn.sanity.io', crossorigin: 'anonymous' },
    { href: 'https://cdn.sanity.io', crossorigin: 'anonymous' },
  ]

  // Check if preconnect already exists, if not add it
  preconnectDomains.forEach(({ href, crossorigin }) => {
    const existing = document.querySelector(`link[rel="preconnect"][href="${href}"]`)
    if (!existing) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      if (crossorigin) {
        link.crossOrigin = crossorigin
      }
      // Insert at the beginning of head for priority
      document.head.insertBefore(link, document.head.firstChild)
    }
  })
})

