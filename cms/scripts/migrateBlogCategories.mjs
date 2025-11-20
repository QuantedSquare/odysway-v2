import {createClient} from '@sanity/client'
import {log, error} from 'node:console'
import dotenv from 'dotenv'
import process from 'node:process'
import {createId} from './utils/createId.js'
import _ from 'lodash'

dotenv.config()

/**
 * Parse category string by splitting on commas and normalizing each category
 */
function parseCategories(categoryString) {
  if (!categoryString || typeof categoryString !== 'string') return []
  
  return categoryString
    .split(',')
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0)
}

/**
 * Generate a unique key for array items
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11)
}

export default async function migrateBlogCategories() {
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'nu6yntji',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2025-02-19',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })

  const DRY_RUN = (process.env.DRY_RUN || 'true').toLowerCase() === 'false'

  log('📚 Starting blog categories migration (clean slate approach)...\n')

  // Step 1: Fetch all blogs (both published and drafts, with and without legacyCategories)
  log('Step 1: Fetching all blogs (including drafts)...')
  // Fetch all blogs - Sanity queries include both published and drafts by default
  // But we'll also explicitly fetch drafts to be sure
  const allBlogsQuery = `
    *[_type == "blog"]{
      _id,
      title,
      legacyCategories,
      "hasCategories": count(categories) > 0
    }
  `
  const allBlogs = await client.fetch(allBlogsQuery)
  
  // Also explicitly fetch drafts to ensure we get them all
  const draftBlogsQuery = `
    *[_id match "drafts.blog-*"]{
      _id,
      title,
      legacyCategories,
      "hasCategories": count(categories) > 0
    }
  `
  const explicitDrafts = await client.fetch(draftBlogsQuery)
  
  // Combine and deduplicate by _id
  const blogMap = new Map()
  for (const blog of allBlogs) {
    blogMap.set(blog._id, blog)
  }
  for (const blog of explicitDrafts) {
    blogMap.set(blog._id, blog)
  }
  const allBlogsDeduped = Array.from(blogMap.values())
  
  const publishedCount = allBlogsDeduped.filter(b => !b._id.startsWith('drafts.')).length
  const draftCount = allBlogsDeduped.filter(b => b._id.startsWith('drafts.')).length

  const blogsWithLegacyCategories = allBlogsDeduped.filter(
    blog => blog.legacyCategories && blog.legacyCategories.trim() !== ''
  )

  log(`   Found ${allBlogsDeduped.length} total blogs (${publishedCount} published, ${draftCount} drafts)`)
  log(`   Found ${blogsWithLegacyCategories.length} blogs with legacyCategories\n`)

  if (blogsWithLegacyCategories.length === 0) {
    log('✅ No blogs with legacyCategories found. Nothing to migrate.')
    return
  }

  // Step 2: Unassign all categories from all blogs (published and drafts)
  log('Step 2: Unassigning all categories from blogs...')
  const blogsWithCategories = allBlogsDeduped.filter(blog => blog.hasCategories)
  
  log(`   Found ${blogsWithCategories.length} blogs with assigned categories`)
  
  if (blogsWithCategories.length > 0) {
    if (!DRY_RUN) {
      try {
        // Process in batches to avoid overwhelming the API
        const batchSize = 50
        let processed = 0
        
        for (let i = 0; i < blogsWithCategories.length; i += batchSize) {
          const batch = blogsWithCategories.slice(i, i + batchSize)
          const unassignMutations = batch.map(blog => ({
            patch: {
              id: blog._id,
              set: {
                categories: [],
              },
            },
          }))
          
          await client.mutate(unassignMutations)
          processed += batch.length
          log(`   Processed ${processed}/${blogsWithCategories.length} blogs...`)
        }
        
        log(`   ✅ Successfully unassigned categories from ${blogsWithCategories.length} blog(s)`)
        
        // Verify unassignment worked by checking a few blogs
        log(`   Verifying unassignment...`)
        const sampleBlogs = await client.fetch(`
          *[_type == "blog" && _id in $ids]{
            _id,
            "categoryCount": count(categories)
          }
        `, {
          ids: blogsWithCategories.slice(0, 10).map(b => b._id)
        })
        
        const stillHasCategories = sampleBlogs.filter(b => b.categoryCount > 0)
        if (stillHasCategories.length > 0) {
          log(`   ⚠️  Warning: ${stillHasCategories.length} sample blogs still have categories after unassignment`)
        } else {
          log(`   ✓ Verification passed: sample blogs have no categories`)
        }
      } catch (err) {
        error('   ❌ Error unassigning categories:', err)
        throw err
      }
    } else {
      log(`   ⚠️  DRY RUN: Would unassign categories from ${blogsWithCategories.length} blog(s)`)
    }
  } else {
    log(`   ✓ No blogs have categories assigned`)
  }

  // Step 3: Check for remaining references and delete all existing blogCategory documents
  log('\nStep 3: Checking for remaining references and deleting all existing blogCategory documents...')
  const existingCategories = await client.fetch(`
    *[_type == "blogCategory"]{
      _id,
      title,
      "referencedBy": *[references(^._id)]{
        _id,
        _type,
        title
      }
    }
  `)

  log(`   Found ${existingCategories.length} existing blogCategory documents`)

  // Check if any categories still have references
  const categoriesWithRefs = existingCategories.filter(cat => cat.referencedBy && cat.referencedBy.length > 0)
  if (categoriesWithRefs.length > 0) {
    log(`   ⚠️  Warning: ${categoriesWithRefs.length} categories still have references:`)
    for (const cat of categoriesWithRefs) {
      const refs = cat.referencedBy.map(r => `${r._type} "${r.title || r._id}"`).join(', ')
      log(`      - "${cat.title}" (${cat._id}) referenced by: ${refs}`)
    }
    log(`   This might indicate that unassignment didn't work for all documents.`)
  }

  if (existingCategories.length > 0) {
    if (!DRY_RUN) {
      try {
        // Try to delete, but handle errors gracefully
        const deleteMutations = existingCategories.map(cat => ({
          delete: {
            id: cat._id,
          },
        }))
        
        // Delete in batches to better handle errors
        const batchSize = 50
        let deletedCount = 0
        let failedCount = 0

        for (let i = 0; i < deleteMutations.length; i += batchSize) {
          const batch = deleteMutations.slice(i, i + batchSize)
          try {
            await client.mutate(batch)
            deletedCount += batch.length
            log(`   Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} categories`)
          } catch (batchErr) {
            failedCount += batch.length
            error(`   ⚠️  Failed to delete batch ${Math.floor(i / batchSize) + 1}:`, batchErr.message)
            // Continue with next batch
          }
        }

        if (deletedCount > 0) {
          log(`   ✅ Successfully deleted ${deletedCount} blogCategory document(s)`)
        }
        if (failedCount > 0) {
          log(`   ⚠️  Failed to delete ${failedCount} blogCategory document(s) (may still have references)`)
        }
      } catch (err) {
        error('   ❌ Error deleting blogCategories:', err)
        // Don't throw - continue with migration even if some deletions fail
        log('   Continuing with migration...')
      }
    } else {
      log(`   ⚠️  DRY RUN: Would delete ${existingCategories.length} blogCategory document(s)`)
    }
  } else {
    log(`   ✓ No existing blogCategory documents to delete`)
  }

  // Step 4: Extract and deduplicate category strings (split by comma)
  log('\nStep 4: Extracting unique category strings (splitting by comma)...')
  const allCategoryStrings = []
  
  for (const blog of blogsWithLegacyCategories) {
    const categories = parseCategories(blog.legacyCategories)
    allCategoryStrings.push(...categories)
  }

  // Use lodash uniq to deduplicate
  const uniqueCategories = _.uniq(allCategoryStrings).sort()
  log(`   Found ${uniqueCategories.length} unique individual categories:`)
  log(`   ${uniqueCategories.join(', ')}\n`)

  // Step 5: Create all blogCategory documents
  log('Step 5: Creating blogCategory documents...')
  const categoryIdMap = new Map() // Maps category title -> blogCategory _id
  const categoriesToCreate = []

  for (const categoryTitle of uniqueCategories) {
    const categoryId = createId('blogCategory', categoryTitle)
    const categoryDoc = {
      _id: categoryId,
      _type: 'blogCategory',
      title: categoryTitle,
    }

    categoriesToCreate.push(categoryDoc)
    categoryIdMap.set(categoryTitle, categoryId)
    log(`   + Creating: "${categoryTitle}" (${categoryId})`)
  }

  // Create all blogCategory documents
  if (categoriesToCreate.length > 0) {
    log(`\n   Prepared ${categoriesToCreate.length} blogCategory document(s) to create`)
    
    if (!DRY_RUN) {
      try {
        const tx = client.transaction()
        for (const categoryDoc of categoriesToCreate) {
          tx.createOrReplace(categoryDoc)
        }
        await tx.commit()
        log(`   ✅ Successfully created ${categoriesToCreate.length} blogCategory document(s)`)
      } catch (err) {
        error('   ❌ Error creating blogCategories:', err)
        throw err
      }
    } else {
      log(`   ⚠️  DRY RUN: blogCategories not created (set DRY_RUN=false to apply)`)
    }
  } else {
    log(`   ⚠️  No categories to create`)
  }

  // Step 6: Reassign categories to blogs
  log('\nStep 6: Reassigning categories to blogs...')
  const blogMutations = []

  for (const blog of blogsWithLegacyCategories) {
    // Parse the legacy categories (split by comma)
    const legacyCategories = parseCategories(blog.legacyCategories)
    if (legacyCategories.length === 0) continue

    // Get category IDs for all categories in this blog
    const categoryIdsToAdd = []
    const missingCategories = []

    for (const categoryTitle of legacyCategories) {
      const categoryId = categoryIdMap.get(categoryTitle)
      if (!categoryId) {
        missingCategories.push(categoryTitle)
        continue
      }
      categoryIdsToAdd.push(categoryId)
    }

    if (missingCategories.length > 0) {
      log(`   ⚠️  Warning: Could not find category IDs for "${missingCategories.join(', ')}" in blog "${blog.title}"`)
    }

    if (categoryIdsToAdd.length === 0) continue

    // Generate unique _key values for all category references
    const categoryRefs = categoryIdsToAdd.map((id) => ({
      _key: `category-${generateKey()}`,
      _type: 'reference',
      _ref: id,
      _weak: true
    }))

    blogMutations.push({
      patch: {
        id: blog._id,
        set: {
          categories: categoryRefs,
        },
      },
    })

    const categoryNames = categoryIdsToAdd
      .map(id => {
        for (const [name, catId] of categoryIdMap.entries()) {
          if (catId === id) return name
        }
        return null
      })
      .filter(Boolean)
      .join(', ')

    log(`   + Assigning categories to blog "${blog.title}": ${categoryNames}`)
  }

  // Apply blog updates
  if (blogMutations.length > 0) {
    log(`\n   Prepared ${blogMutations.length} blog update(s)`)
    
    if (!DRY_RUN) {
      try {
        await client.mutate(blogMutations)
        log(`   ✅ Successfully reassigned categories to ${blogMutations.length} blog(s)`)
      } catch (err) {
        error('   ❌ Error reassigning categories:', err)
        throw err
      }
    } else {
      log(`   ⚠️  DRY RUN: Blog updates not applied (set DRY_RUN=false to apply)`)
    }
  } else {
    log(`   ⚠️  No blogs to update`)
  }

  // Summary
  log('\n' + '='.repeat(60))
  log('📊 Migration Summary:')
  log(`   Total blogs: ${allBlogs.length}`)
  log(`   Blogs with legacyCategories: ${blogsWithLegacyCategories.length}`)
  log(`   Blogs unassigned: ${blogsWithCategories.length}`)
  log(`   BlogCategories deleted: ${existingCategories.length}`)
  log(`   Unique individual categories found: ${uniqueCategories.length}`)
  log(`   New categories created: ${categoriesToCreate.length}`)
  log(`   Blogs reassigned: ${blogMutations.length}`)
  log(`   Dry run: ${DRY_RUN}`)
  log('='.repeat(60))
}

migrateBlogCategories().catch(err => {
  error('❌ Error:', err.message)
  if (err.details) {
    error('Details:', JSON.stringify(err.details, null, 2))
  }
  process.exit(1)
})

