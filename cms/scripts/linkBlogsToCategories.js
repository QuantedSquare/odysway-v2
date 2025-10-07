import {log, error} from 'node:console'

/**
 * Link each category to its corresponding blog post (one-to-one relationship)
 * Matches category slug with blog slug to find the correct blog
 */
export default async function linkBlogsToCategories(client) {
  try {
    log('Starting to link blogs to categories...\n')

    // Fetch all categories
    const categories = await client.fetch('*[_type == "category"]{ _id, title, slug }')
    log(`Found ${categories.length} categories`)

    // Fetch all blogs
    const blogs = await client.fetch('*[_type == "blog"]{ _id, title, slug }')
    log(`Found ${blogs.length} blogs\n`)

    // Create a map of blogs by their slug for quick lookup
    const blogsBySlug = {}
    blogs.forEach((blog) => {
      if (blog.slug?.current) {
        blogsBySlug[blog.slug.current] = blog
      }
    })

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

      // Find blog with matching slug in the category folder
      // Blog slugs are in format: category-slug/blog-slug
      // We need to find blogs that were in this category's folder
      const matchingBlog = blogs.find((blog) => {
        // The blog was created from a file in the category folder
        // Check if any blog's slug matches common patterns for this category
        return blog.slug?.current && blog.title
      })

      // For now, match by finding the first blog file that was in this category directory
      // We'll use a query to find blogs created from files in this category's directory
      const categoryBlogs = await client.fetch(
        `*[_type == "blog" && slug.current match $pattern][0]{ _id, title }`,
        {pattern: `${categorySlug}*`}
      )

      if (categoryBlogs) {
        log(`📁 ${category.title} → ${categoryBlogs.title}`)
        tx.patch(category._id, {
          set: {
            blog: {
              _type: 'reference',
              _ref: categoryBlogs._id,
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
