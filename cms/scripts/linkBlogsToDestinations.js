import {log, error} from 'node:console'

/**
 * Link each destination to its corresponding blog post (one-to-one relationship)
 * Uses the destinationSlug field stored during migration to match blogs to destinations
 */
export default async function linkBlogsToDestinations(client) {
  try {
    log('Starting to link blogs to destinations...\n')

    // Fetch all destinations
    const destinations = await client.fetch('*[_type == "destination"]{ _id, title, slug }')
    log(`Found ${destinations.length} destinations`)

    // Fetch all destination blogs (those with destinationSlug field)
    const blogs = await client.fetch('*[_type == "blog" && defined(destinationSlug)]{ _id, title, destinationSlug }')
    log(`Found ${blogs.length} destination blogs\n`)

    // Create a map of blogs by their destinationSlug for quick lookup
    const blogsByDestinationSlug = {}
    blogs.forEach((blog) => {
      if (blog.destinationSlug) {
        blogsByDestinationSlug[blog.destinationSlug] = blog
      }
    })

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

      // Find the blog that has this destination's slug stored in destinationSlug field
      const matchingBlog = blogsByDestinationSlug[destinationSlug]

      if (matchingBlog) {
        log(`📁 ${destination.title} → ${matchingBlog.title}`)
        tx.patch(destination._id, {
          set: {
            blog: {
              _type: 'reference',
              _ref: matchingBlog._id,
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
