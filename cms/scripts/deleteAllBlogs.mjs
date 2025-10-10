/* Delete all blog documents and remove references from categories/destinations */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'nu6yntji',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function deleteAllBlogs() {
  console.log('🔄 Deleting all blogs and removing references...\n')

  // Get all blog IDs (both published and drafts)
  const allBlogIds = await client.fetch(
    `*[_type == "blog"]._id`
  )

  console.log(`Found ${allBlogIds.length} blogs to delete\n`)

  if (allBlogIds.length === 0) {
    console.log('No blogs to delete!')
    return
  }

  // Find all categories and destinations that reference blogs
  const categoriesWithBlogs = await client.fetch(
    `*[_type == "category" && defined(blog)]{_id, title, "blogId": blog._ref}`
  )

  const destinationsWithBlogs = await client.fetch(
    `*[_type == "destination" && defined(blog)]{_id, title, "blogId": blog._ref}`
  )

  console.log(`Found ${categoriesWithBlogs.length} categories with blog references`)
  console.log(`Found ${destinationsWithBlogs.length} destinations with blog references\n`)

  console.log('⏳ Proceeding with deletion in 3 seconds...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  let deleted = 0
  let referencesRemoved = 0

  console.log('\n🗑️  Step 1: Removing blog references from categories and destinations...\n')

  // Remove blog references from categories
  for (const cat of categoriesWithBlogs) {
    try {
      await client
        .patch(cat._id)
        .unset(['blog'])
        .commit()

      referencesRemoved++
      console.log(`  ✅ Removed blog reference from category: ${cat.title}`)
    } catch (err) {
      console.error(`  ❌ Failed to update category ${cat.title}: ${err.message}`)
    }
  }

  // Remove blog references from destinations
  for (const dest of destinationsWithBlogs) {
    try {
      await client
        .patch(dest._id)
        .unset(['blog'])
        .commit()

      referencesRemoved++
      console.log(`  ✅ Removed blog reference from destination: ${dest.title}`)
    } catch (err) {
      console.error(`  ❌ Failed to update destination ${dest.title}: ${err.message}`)
    }
  }

  console.log(`\n🗑️  Step 2: Deleting ${allBlogIds.length} blogs...\n`)

  // Now delete all blogs
  for (const blogId of allBlogIds) {
    try {
      await client.delete(blogId)
      deleted++

      if (deleted % 50 === 0) {
        console.log(`  Deleted ${deleted}/${allBlogIds.length} blogs...`)
      }
    } catch (err) {
      console.error(`  ❌ Failed to delete ${blogId}: ${err.message}`)
    }
  }

  console.log(`\n✅ Complete!`)
  console.log(`   Blogs deleted: ${deleted}/${allBlogIds.length}`)
  console.log(`   References removed: ${referencesRemoved}`)
}

deleteAllBlogs().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
