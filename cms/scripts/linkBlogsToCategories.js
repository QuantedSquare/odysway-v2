import {log, error} from 'node:console'

/**
 * Link each category to its corresponding blog post (one-to-one relationship)
 * Uses the categorySlug field stored during migration to match blogs to categories
 */
export default async function linkBlogsToCategories(client) {
  try {
    log('Starting to link blogs to categories...\n')

    // Fetch all categories
    const categories = await client.fetch('*[_type == "category"]{ _id, title, slug }')
    log(`Found ${categories.length} categories`)

    // Fetch all category blogs (those with categorySlug field)
    const blogs = await client.fetch('*[_type == "blog" && defined(categorySlug)]{ _id, title, categorySlug }')
    log(`Found ${blogs.length} category blogs\n`)

    // Create a map of blogs by their categorySlug for quick lookup
    const blogsByCategorySlug = {}
    blogs.forEach((blog) => {
      if (blog.categorySlug) {
        blogsByCategorySlug[blog.categorySlug] = blog
      }
    })
     log("blogsByCategorySlug: ", blogsByCategorySlug)
    // Update each category with its matching blog
    const tx = client.transaction()
    let linkedCount = 0
    let notFoundCount = 0

    for (const category of categories) {
      const categorySlug = category.slug?.current

      if (!categorySlug) {
        log(`⚠️  ${category.title}: No slug`)
        continue
      }

      // Find the blog that has this category's slug stored in categorySlug field
      const matchingBlog = blogsByCategorySlug[categorySlug]
 
      if (matchingBlog) {
        log(`📁 ${category.title} → ${matchingBlog.title}`)
        tx.patch(category._id, {
          set: {
            blog: {
              _type: 'reference',
              _ref: matchingBlog._id,
              _weak: true
            },
          },
        })
        linkedCount++
      } else {
        log(`⚠️  ${category.title}: No matching blog found`)
        notFoundCount++
      }
    }

    // Commit the transaction
    if (linkedCount > 0) {
      log(`\n⏳ Updating ${linkedCount} categories...`)
      await tx.commit()
      log(`✅ Successfully linked blogs to categories!`)
    } else {
      log('\n⚠️  No categories needed updating')
    }

    log(`\nSummary:`)
    log(`  Categories linked: ${linkedCount}`)
    log(`  Categories without match: ${notFoundCount}`)
  } catch (err) {
    error('❌ Error linking blogs to categories:', err.message)
    throw err
  }
}
