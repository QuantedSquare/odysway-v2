import {log, error} from 'node:console'

/**
 * Link each destination to its corresponding blog post (one-to-one relationship)
 * Matches destination slug with blog slug to find the correct blog
 */
export default async function linkBlogsToDestinations(client) {
  try {
    log('Starting to link blogs to destinations...\n')

    // Fetch all destinations
    const destinations = await client.fetch('*[_type == "destination"]{ _id, title, slug }')
    log(`Found ${destinations.length} destinations`)

    // Fetch all blogs
    const blogs = await client.fetch('*[_type == "blog"]{ _id, title, slug }')
    log(`Found ${blogs.length} blogs\n`)

    // Update each destination with its matching blog
    const tx = client.transaction()
    let linkedCount = 0
    let notFoundCount = 0

    for (const destination of destinations) {
      const destinationSlug = destination.slug?.current

      if (!destinationSlug) {
        log(`⚠️  ${destination.title}: No slug`)
        continue
      }

      // Find blog with matching slug in the destination folder
      // We'll use a query to find blogs created from files in this destination's directory
      const destinationBlog = await client.fetch(
        `*[_type == "blog" && slug.current match $pattern][0]{ _id, title }`,
        {pattern: `${destinationSlug}*`}
      )

      if (destinationBlog) {
        log(`📁 ${destination.title} → ${destinationBlog.title}`)
        tx.patch(destination._id, {
          set: {
            blog: {
              _type: 'reference',
              _ref: destinationBlog._id,
            },
          },
        })
        linkedCount++
      } else {
        log(`⚠️  ${destination.title}: No matching blog found`)
        notFoundCount++
      }
    }

    // Commit the transaction
    if (linkedCount > 0) {
      log(`\n⏳ Updating ${linkedCount} destinations...`)
      await tx.commit()
      log(`✅ Successfully linked blogs to destinations!`)
    } else {
      log('\n⚠️  No destinations needed updating')
    }

    log(`\nSummary:`)
    log(`  Destinations linked: ${linkedCount}`)
    log(`  Destinations without match: ${notFoundCount}`)
  } catch (err) {
    error('❌ Error linking blogs to destinations:', err.message)
    throw err
  }
}
