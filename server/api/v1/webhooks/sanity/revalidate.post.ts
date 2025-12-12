import { defineEventHandler, readBody, getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // Verify webhook secret for security
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    const body = await readBody(event)
    console.log('✓ Sanity webhook received:', body)

    // Extract document type and slug from the webhook payload
    const documentType = body._type
    const slug = body.slug?.current

    const pathsToRevalidate: string[] = []

    // === Pages with Dynamic Slugs ===
    if (documentType === 'voyage' && slug) {
      pathsToRevalidate.push(`/voyages/${slug}`)
      // Also revalidate search and destination pages that might list this voyage
      pathsToRevalidate.push('/voyages')
      pathsToRevalidate.push('/prochains-departs')
    }
    else if (documentType === 'blog' && slug) {
      pathsToRevalidate.push(`/${slug}`) // Blog posts are at root level
      pathsToRevalidate.push('/blog') // Blog index page
    }
    else if (documentType === 'destination' && slug) {
      pathsToRevalidate.push(`/destinations/${slug}`)
      pathsToRevalidate.push('/destinations') // Destinations index
      pathsToRevalidate.push('/voyages') // Search page uses destinations
    }
    else if (documentType === 'category' && slug) {
      pathsToRevalidate.push(`/thematiques/${slug}`)
      pathsToRevalidate.push('/thematiques') // Categories index
    }
    else if (documentType === 'experience' && slug) {
      pathsToRevalidate.push(`/experiences/${slug}`)
      pathsToRevalidate.push('/experiences') // Experiences index
    }

    // === Singleton Pages (Fixed URLs) ===
    else if (documentType === 'homePage') {
      pathsToRevalidate.push('/')
    }
    else if (documentType === 'entreprise') {
      pathsToRevalidate.push('/entreprise')
    }
    else if (documentType === 'surMesure') {
      pathsToRevalidate.push('/sur-mesure')
    }
    else if (documentType === 'visionVoyageOdysway') {
      pathsToRevalidate.push('/vision-voyage-odysway')
    }
    else if (documentType === 'privacyPolicy') {
      pathsToRevalidate.push('/politique-de-confidentialite')
    }
    else if (documentType === 'legalMentions') {
      pathsToRevalidate.push('/mentions-legales')
    }
    else if (documentType === 'chequesVacances') {
      pathsToRevalidate.push('/cheques-vacances')
    }
    else if (documentType === 'conditionsGeneralesVente') {
      pathsToRevalidate.push('/conditions-generales-de-vente')
    }
    else if (documentType === 'confirmation') {
      pathsToRevalidate.push('/confirmation')
    }
    else if (documentType === 'offreCadeau') {
      pathsToRevalidate.push('/offre-cadeau')
    }
    else if (documentType === 'recruitment') {
      pathsToRevalidate.push('/nous-recrutons')
    }
    else if (documentType === 'faq') {
      pathsToRevalidate.push('/faq')
    }
    else if (documentType === 'avisVoyageurs') {
      pathsToRevalidate.push('/avis-voyageurs')
    }
    else if (documentType === 'page_contact') {
      pathsToRevalidate.push('/contact')
    }
    else if (documentType === 'search') {
      pathsToRevalidate.push('/search')
      pathsToRevalidate.push('/voyages')
      pathsToRevalidate.push('/prochains-departs')
    }
    else if (documentType === 'checkout') {
      pathsToRevalidate.push('/checkout')
    }
    else if (documentType === 'devis') {
      pathsToRevalidate.push('/devis')
    }

    // === Page Settings (used by multiple pages) ===
    else if (documentType === 'page_voyage') {
      // This affects all voyage detail pages
      // Note: Can't revalidate wildcards with bypass token
      // These pages will update via time-based ISR (60s)
      console.log('⚠️  page_voyage updated - all voyage pages will update within 60s via ISR')
    }
    else if (documentType === 'page_thematiques') {
      pathsToRevalidate.push('/thematiques')
      console.log('ℹ️  page_thematiques updated - individual category pages update via ISR')
    }
    else if (documentType === 'page_experiences') {
      pathsToRevalidate.push('/experiences')
      console.log('ℹ️  page_experiences updated - individual experience pages update via ISR')
    }
    else if (documentType === 'page_blog') {
      pathsToRevalidate.push('/blog')
    }

    // === Global Content (affects many/all pages) ===
    else if (documentType === 'header') {
      // Header affects all pages - revalidate critical ones
      pathsToRevalidate.push('/')
      pathsToRevalidate.push('/destinations')
      pathsToRevalidate.push('/thematiques')
      pathsToRevalidate.push('/experiences')
      pathsToRevalidate.push('/blog')
      console.log('⚠️  Header updated - revalidating main navigation pages')
    }
    else if (documentType === 'footer') {
      // Footer affects all pages - revalidate critical ones
      pathsToRevalidate.push('/')
      pathsToRevalidate.push('/contact')
      console.log('⚠️  Footer updated - revalidating main pages')
    }
    else if (documentType === 'newsletter') {
      // Newsletter component used on multiple pages
      pathsToRevalidate.push('/')
      console.log('⚠️  Newsletter content updated')
    }
    else if (documentType === 'ctas') {
      // CTAs used across the site
      pathsToRevalidate.push('/')
      console.log('⚠️  CTAs updated')
    }
    else if (documentType === 'voyage_card') {
      // Voyage cards used in listings
      pathsToRevalidate.push('/search')
      pathsToRevalidate.push('/destinations')
      pathsToRevalidate.push('/thematiques')
      pathsToRevalidate.push('/experiences')
      console.log('⚠️  Voyage card content updated - revalidating listing pages')
    }

    // === Content Without Direct Pages (logging only) ===
    else if (['teamMember', 'review', 'partner', 'region', 'tops'].includes(documentType)) {
      // These are referenced by other pages but don't have their own pages
      console.log(`ℹ️  ${documentType} updated - referenced content, no direct page to revalidate, revalidating some`)
      // Reviews might be on homepage or voyage pages
      pathsToRevalidate.push('/')
      pathsToRevalidate.push('/avis-voyageurs')
      pathsToRevalidate.push('/vision-voyage-odysway')
    }
    else {
      console.log(`⚠️  Unknown document type: ${documentType}`)
    }

    // === Update Algolia Index ===
    if (['voyage', 'destination', 'region'].includes(documentType)) {
      console.log('🔄 Triggering Algolia index update for type:', documentType)
      // We don't await this to avoid timing out the webhook response
      // But we log errors if possible
      updateAlgoliaIndex()
        .then(res => console.log(`✅ Algolia updated: ${res.count} records processed`))
        .catch(err => console.error('❌ Algolia update failed:', err))
    }

    // Trigger on-demand revalidation using Vercel's bypass token
    // Note: This is NOT the same as VERCEL_AUTOMATION_BYPASS_SECRET
    // VERCEL_BYPASS_TOKEN is a custom secret you create for ISR revalidation
    const bypassToken = process.env.VERCEL_BYPASS_TOKEN

    if (bypassToken && pathsToRevalidate.length > 0) {
      const config = useRuntimeConfig()
      const baseUrls = new Set<string>()
      const preprodUrl = process.env.PREPROD_SITE_URL || 'https://dev.odysway.com'

      // Always hit production
      if (config.public.siteURL) baseUrls.add(config.public.siteURL)
      // Also hit preprod
      baseUrls.add(preprodUrl)

      console.log(`Starting revalidation for ${pathsToRevalidate.length} paths across ${baseUrls.size} base URLs with bypass token: ${bypassToken ? 'SET' : 'NOT SET'}`)

      const revalidationResults = []

      for (const baseUrl of baseUrls) {
        for (const path of pathsToRevalidate) {
          try {
            const url = `${baseUrl}${path}`

            console.log(`Attempting revalidation for ${url} (token length: ${bypassToken?.length || 0})`)

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'x-prerender-revalidate': bypassToken,
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              },
              redirect: 'follow',
            })

            // Consume the response body to ensure request completes
            await response.text().catch(() => { })

            const cacheStatus = response.headers.get('x-vercel-cache') || 'UNKNOWN'
            const vercelId = response.headers.get('x-vercel-id') || 'UNKNOWN'
            const isSuccess = cacheStatus === 'BYPASS' || cacheStatus === 'MISS' || cacheStatus === 'STALE'

            console.log(`Revalidation response for ${url}:`, {
              status: response.status,
              cacheStatus,
              isSuccess,
              vercelId,
              bypassTokenLength: bypassToken?.length || 0,
              headers: {
                'x-vercel-cache': cacheStatus,
                'x-vercel-id': vercelId,
                'cache-control': response.headers.get('cache-control'),
              },
            })

            if (cacheStatus === 'HIT') {
              console.log(`⚠️  Cache HIT for ${url} - bypass token not recognized (Nuxt 3 ISR limitation)`)
              revalidationResults.push({
                baseUrl,
                path,
                status: 'warning',
                cacheStatus,
                note: 'HIT - will update via 60s ISR fallback',
              })
            }
            else if (isSuccess || response.status === 200) {
              revalidationResults.push({ baseUrl, path, status: 'success', cacheStatus, note: response.status === 200 ? 'Status 200' : undefined })
            }
            else {
              revalidationResults.push({ baseUrl, path, status: 'warning', cacheStatus })
            }

            if (pathsToRevalidate.length > 1) {
              await new Promise(resolve => setTimeout(resolve, 100))
            }
          }
          catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            console.error(`❌ Failed to revalidate ${path} on ${baseUrl}:`, err)
            revalidationResults.push({ baseUrl, path, status: 'failed', error: errorMessage })
          }
        }
      }

      // Check if any revalidations got HIT (bypass token not working)
      const hasHits = revalidationResults.some(r => r.cacheStatus === 'HIT')

      return {
        success: true,
        message: hasHits
          ? 'Webhook processed. Pages will update within 60 seconds via ISR.'
          : 'On-demand revalidation triggered. Changes are live!',
        documentType,
        slug,
        revalidationResults,
        note: hasHits
          ? 'Bypass token not recognized - using 60s ISR fallback (normal for Nuxt 3)'
          : 'Instant revalidation working',
        timestamp: new Date().toISOString(),
      }
    }

    // If no bypass token configured, rely on ISR timing
    console.log('⚠️  No VERCEL_BYPASS_TOKEN configured. Relying on time-based ISR (60s)')
    console.log('✓ Content updated, affected paths:', pathsToRevalidate)

    return {
      success: true,
      message: 'Webhook received. Content will update within 60 seconds via ISR.',
      documentType,
      slug,
      pathsAffected: pathsToRevalidate,
      note: 'For instant updates, configure VERCEL_BYPASS_TOKEN',
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    console.error('❌ Webhook error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process webhook',
    })
  }
})
