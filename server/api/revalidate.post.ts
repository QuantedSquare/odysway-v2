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

    // Determine which paths need revalidation based on document type
    if (documentType === 'voyage' && slug) {
      pathsToRevalidate.push(`/voyages/${slug}`)
    }
    else if (documentType === 'blog' && slug) {
      pathsToRevalidate.push(`/${slug}`)
    }
    else if (documentType === 'destination' && slug) {
      pathsToRevalidate.push(`/destinations/${slug}`)
      pathsToRevalidate.push('/destinations')
    }
    else if (documentType === 'category' && slug) {
      pathsToRevalidate.push(`/thematiques/${slug}`)
    }
    else if (documentType === 'homePage') {
      pathsToRevalidate.push('/')
    }

    // Trigger on-demand revalidation using Vercel's bypass token
    const bypassToken = process.env.VERCEL_BYPASS_TOKEN

    if (bypassToken && pathsToRevalidate.length > 0) {
      const config = useRuntimeConfig()
      const baseUrl = config.public.siteURL

      const revalidationResults = []

      for (const path of pathsToRevalidate) {
        try {
          // Trigger revalidation by making a HEAD request with the bypass token
          const url = `${baseUrl}${path}`
          await $fetch(url, {
            method: 'HEAD',
            headers: {
              'x-prerender-revalidate': bypassToken,
            },
          })

          console.log(`✓ Revalidated instantly: ${path}`)
          revalidationResults.push({ path, status: 'success' })
        }
        catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          console.error(`❌ Failed to revalidate ${path}:`, err)
          revalidationResults.push({ path, status: 'failed', error: errorMessage })
        }
      }

      return {
        success: true,
        message: 'On-demand revalidation triggered. Changes are live!',
        documentType,
        slug,
        revalidationResults,
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
