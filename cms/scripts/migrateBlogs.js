import fs from 'node:fs'
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import yaml from 'js-yaml'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'

const categoriesFolderPath = '../content/categories'
const destinationsFolderPath = '../content/destinations'
const blogFolderPath = '../content/blog'

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    return null
  }

  try {
    return yaml.load(match[1])
  } catch (err) {
    error('Error parsing frontmatter:', err.message)
    return null
  }
}

/**
 * Read JSON file from directory to get actual slug
 */
function getSlugFromJson(dirPath, folderName) {
  try {
    const jsonFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'))
    if (jsonFiles.length > 0) {
      const jsonPath = path.join(dirPath, jsonFiles[0])
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      // Handle both slug.current (for categories/destinations) and slug (for direct string)
      const slug = jsonData.slug?.current || jsonData.slug || folderName
      return slug
    }
  } catch (e) {
    log(`⚠️  Could not read JSON for ${folderName}, using folder name`)
  }
  return folderName
}

/**
 * Extract and populate common frontmatter fields into blog document
 */
function populateFrontmatterFields(blogDoc, frontmatter) {
  if (frontmatter.publishedAt) blogDoc.publishedAt = frontmatter.publishedAt
  if (frontmatter.readingTime) blogDoc.readingTime = frontmatter.readingTime
  if (frontmatter.blogType) blogDoc.blogType = frontmatter.blogType
  if (frontmatter.badgeColor) blogDoc.badgeColor = frontmatter.badgeColor
  if (frontmatter.categories) blogDoc.legacyCategories = frontmatter.categories

  // SEO fields
  if (frontmatter.seo?.title) blogDoc.seoTitle = frontmatter.seo.title
  if (frontmatter.seo?.description) blogDoc.seoDescription = frontmatter.seo.description

  // Navigation overrides
  if (frontmatter.navigation?.title) blogDoc.navigationTitle = frontmatter.navigation.title
  if (frontmatter.navigation?.description) blogDoc.navigationDescription = frontmatter.navigation.description

  // Handle tags
  if (frontmatter.tags) {
    if (typeof frontmatter.tags === 'string' && frontmatter.tags.trim()) {
      blogDoc.tags = frontmatter.tags.split(',').map((t) => t.trim()).filter(Boolean)
    } else if (Array.isArray(frontmatter.tags)) {
      blogDoc.tags = frontmatter.tags.filter(Boolean)
    }
  }
}

/**
 * Link author to team member by first name
 */
async function linkAuthor(blogDoc, frontmatter, client, reporter, blogID) {
  if (!frontmatter.author) return

  const firstName = frontmatter.author.split(' ')[0].trim()
  const authorQuery = `*[_type == "teamMember" && name match $firstName][0]._id`
  const authorId = await client.fetch(authorQuery, {firstName: `${firstName}*`})

  if (authorId) {
    blogDoc.author = {_type: 'reference', _ref: authorId}
    log(`    ✓ Linked author: ${frontmatter.author} → ${firstName}`)
  } else {
    reporter.recordWarning(blogID, `Team member not found for author: ${frontmatter.author}`)
    log(`    ⚠️  Author not found: ${frontmatter.author}`)
  }
}

/**
 * Handle featured image
 */
function handleFeaturedImage(blogDoc, frontmatter, assetMapping, reporter, blogID) {
  if (!frontmatter.displayedImg || frontmatter.displayedImg.trim() === '') return

  const imageRef = convertImageReference(
    frontmatter.displayedImg,
    assetMapping,
    frontmatter.title,
    reporter,
    blogID
  )

  if (imageRef) {
    blogDoc.displayedImg = imageRef
    log(`    ✓ Featured image: ${frontmatter.displayedImg}`)
  } else {
    log(`    ⚠️  Featured image not found: ${frontmatter.displayedImg}`)
  }
}

/**
 * Save test sample of converted content
 */
function saveTestSample(frontmatter, mdContent, portableTextBody, mdFile, contextFolder) {
  const testDir = path.join(process.cwd(), 'scripts', 'test')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, {recursive: true})
  }

  const sampleOutput = {
    blog: frontmatter.title,
    context: contextFolder,
    originalMarkdown: mdContent,
    portableText: portableTextBody,
    conversionNotes: [
      'Frontmatter extracted to blog fields',
      'Custom wrappers (::blog-hero-section, ::section-container, ::color-container) removed',
      ':::image-container converted to Portable Text image blocks',
      'Images linked to Sanity assets via asset mapping',
      'Standard markdown (bold, italic, links, headings, quotes) converted',
    ],
  }

  const sanitizedFilename = mdFile.replace('.md', '').replace(/[^a-z0-9-]/g, '-')
  fs.writeFileSync(
    path.join(testDir, `blog-${sanitizedFilename}.json`),
    JSON.stringify(sampleOutput, null, 2)
  )
}

/**
 * Debug and commit a batch
 */
async function commitBatch(currentBatch, batchNumber, client, isCreateOrReplace = false) {
  log(`\n⏳ Committing batch ${batchNumber} (${currentBatch.length} posts)...`)
  log(`   🔍 DEBUG BEFORE COMMIT - All documents in batch:`)
  currentBatch.forEach((doc, idx) => {
    log(`      [${idx}] ${doc.title.substring(0, 40)}... | categorySlug="${doc.categorySlug || 'NULL'}" | destinationSlug="${doc.destinationSlug || 'NULL'}" | testField="${doc.testMigrationField || 'NULL'}"`)
  })

  const tx = client.transaction()
  currentBatch.forEach((doc) => {
    if (isCreateOrReplace) {
      tx.createOrReplace(doc)
    } else {
      tx.create(doc)
    }
  })
  await tx.commit()
  log(`✅ Batch ${batchNumber} committed successfully!`)
}

/**
 * Process a single blog markdown file
 */
async function processBlogFile(mdFile, dirPath, contextFolder, client, assetMapping, reporter, options = {}) {
  const {categorySlug, destinationSlug} = options

  reporter.incrementTotal()

  try {
    const mdPath = path.join(dirPath, mdFile)
    const mdContent = fs.readFileSync(mdPath, 'utf8')

    // Extract frontmatter from markdown
    const frontmatter = extractFrontmatter(mdContent)

    if (!frontmatter) {
      reporter.recordWarning(`${contextFolder}/${mdFile}`, 'No frontmatter found in markdown')
      log(`  ⚠️  No frontmatter in ${mdFile}`)
      return null
    }

    if (!frontmatter.title) {
      reporter.recordWarning(`${contextFolder}/${mdFile}`, 'No title in frontmatter')
      log(`  ⚠️  No title in ${mdFile}`)
      return null
    }

    // Skip unpublished blogs to avoid duplicate "Lorem ipsum" errors
    if (frontmatter.published === false) {
      log(`  ⏭️  Skipping unpublished: ${frontmatter.title}`)
      return null
    }

    // Generate a unique ID from the title
    const blogID = createId('blog', frontmatter.title)

    log(`\n  📝 ${frontmatter.title}`)

    // Prepare the blog document for Sanity
    const blogDoc = {
      _id: blogID,
      _type: 'blog',
      testMigrationField: "LUL",
      title: frontmatter.title,
      slug: {current: mdFile.replace('.md', '')},
      description: frontmatter.description || '',
      published: frontmatter.published !== undefined ? frontmatter.published : true,
    }

    // Populate common frontmatter fields
    populateFrontmatterFields(blogDoc, frontmatter)

    // Link author
    await linkAuthor(blogDoc, frontmatter, client, reporter, blogID)

    // Handle featured image
    handleFeaturedImage(blogDoc, frontmatter, assetMapping, reporter, blogID)

    // Convert markdown content to Portable Text
    log(`    📝 Converting content...`)
    const portableTextBody = await convertMarkdownToPortableText(mdContent, assetMapping)

    if (portableTextBody && portableTextBody.length > 0) {
      blogDoc.body = portableTextBody
      log(`    ✓ Converted ${portableTextBody.length} content blocks`)

      // Save test sample
      saveTestSample(frontmatter, mdContent, portableTextBody, mdFile, contextFolder)
    } else {
      reporter.recordWarning(blogID, 'No content blocks generated')
      log(`    ⚠️  No content blocks generated`)
    }

    // Set category or destination slug
    if (categorySlug) {
      blogDoc.categorySlug = categorySlug
      blogDoc.testMigrationField = `TEST-CAT-${categorySlug}`
      log(`    🔍 DEBUG FINAL: categorySlug="${categorySlug}" (from JSON), folder="${contextFolder}"`)
      log(`    🔍 DEBUG FINAL: testMigrationField="${blogDoc.testMigrationField}"`)
      log(`    🔍 blogDoc has categorySlug: ${blogDoc.categorySlug !== undefined}`)
      log(`    🔍 blogDoc keys: ${Object.keys(blogDoc).join(', ')}`)
    }
    if (destinationSlug) {
      blogDoc.destinationSlug = destinationSlug
      blogDoc.testMigrationField = `TEST-DEST-${destinationSlug}`
      log(`    🔍 DEBUG FINAL: destinationSlug="${destinationSlug}" (from JSON), folder="${contextFolder}"`)
      log(`    🔍 DEBUG FINAL: testMigrationField="${blogDoc.testMigrationField}"`)
      log(`    🔍 blogDoc has destinationSlug: ${blogDoc.destinationSlug !== undefined}`)
    }

    reporter.recordSuccess()
    log(`    ✅ Blog post prepared`)

    // Final verification before return
    log(`    🔍 BEFORE RETURN: blogDoc.categorySlug="${blogDoc.categorySlug || 'UNDEFINED'}", blogDoc.destinationSlug="${blogDoc.destinationSlug || 'UNDEFINED'}"`)

    return blogDoc
  } catch (err) {
    reporter.recordFailure(`${contextFolder}/${mdFile}`, err.message)
    error(`    ❌ Failed to process ${mdFile}:`, err.message)
    return null
  }
}


export default async function migrateBlogs(client) {
  // Create reporter
  const reporter = new MigrationReporter('blogs')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting blog posts migration...`)

    // Read all category directories
    const categoryDirs = fs
      .readdirSync(categoriesFolderPath, {withFileTypes: true})
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    log(`Found ${categoryDirs.length} category directories to scan for blog posts`)

    // Read all destination directories
    const destinationDirs = fs
      .readdirSync(destinationsFolderPath, {withFileTypes: true})
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    log(`Found ${destinationDirs.length} destination directories to scan for blog posts`)

    // We'll commit in batches to avoid exceeding Sanity's 4MB transaction limit
    const BATCH_SIZE = 30 // Commit every 10 blog posts
    let currentBatch = []
    let batchNumber = 1

    // Track processed blog IDs to avoid duplicates
    const processedBlogIds = new Set()

    // Process category blogs
    log(`\n=== Processing Category Blogs ===`)
    for (const dir of categoryDirs) {
      try {
        const dirPath = path.join(categoriesFolderPath, dir)
        const categorySlugFromJson = getSlugFromJson(dirPath, dir)
        const mdFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.md'))

        if (mdFiles.length === 0) {
          log(`  ℹ️  No markdown files found in ${dir}`)
          continue
        }

        log(`\n📁 Processing category: ${dir}`)
        log(`  Found ${mdFiles.length} markdown file(s)`)

        for (const mdFile of mdFiles) {
          const blogDoc = await processBlogFile(mdFile, dirPath, dir, client, assetMapping, reporter, {
            categorySlug: categorySlugFromJson
          })

          if (blogDoc) {
            const blogDocCopy = {...blogDoc}
            currentBatch.push(blogDocCopy)
            processedBlogIds.add(blogDoc._id) // Track this ID
            log(`    ✓ Added ID to processedBlogIds: ${blogDoc._id} (total: ${processedBlogIds.size})`)

            // Debug: verify slug was preserved after spread operator
            log(`    🔍 VERIFY AFTER PUSH: categorySlug="${blogDocCopy.categorySlug || 'MISSING'}", has ${Object.keys(blogDocCopy).length} keys`)

            // Commit batch if it reaches the limit
            if (currentBatch.length >= BATCH_SIZE) {
              await commitBatch(currentBatch, batchNumber, client, true)
              currentBatch = []
              batchNumber++
            }
          }
        }
      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process directory ${dir}:`, err.message)
      }
    }

    // Process destination blogs
    log(`\n=== Processing Destination Blogs ===`)
    for (const dir of destinationDirs) {
      try {
        const dirPath = path.join(destinationsFolderPath, dir)
        const destinationSlugFromJson = getSlugFromJson(dirPath, dir)
        const mdFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.md'))

        if (mdFiles.length === 0) {
          log(`  ℹ️  No markdown files found in ${dir}`)
          continue
        }

        log(`\n📁 Processing destination: ${dir}`)
        log(`  Found ${mdFiles.length} markdown file(s)`)

        for (const mdFile of mdFiles) {
          const blogDoc = await processBlogFile(mdFile, dirPath, dir, client, assetMapping, reporter, {
            destinationSlug: destinationSlugFromJson
          })

          if (blogDoc) {
            currentBatch.push({...blogDoc})
            processedBlogIds.add(blogDoc._id) // Track this ID
            log(`    ✓ Added ID to processedBlogIds: ${blogDoc._id} (total: ${processedBlogIds.size})`)

            // Commit batch if it reaches the limit
            if (currentBatch.length >= BATCH_SIZE) {
              await commitBatch(currentBatch, batchNumber, client, true)
              currentBatch = []
              batchNumber++
            }
          }
        }
      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process directory ${dir}:`, err.message)
      }
    }

    // Process standalone blogs
    log(`\n=== Processing Standalone Blogs ===`)
    log(`⚠️  Will skip blogs already processed from category/destination folders (${processedBlogIds.size} IDs tracked)`)
    try {
      const mdFiles = fs.readdirSync(blogFolderPath).filter((file) => file.endsWith('.md'))
      log(`Found ${mdFiles.length} standalone blog post(s)`)

      for (const mdFile of mdFiles) {
        const blogDoc = await processBlogFile(mdFile, blogFolderPath, 'blog', client, assetMapping, reporter)

        if (blogDoc) {
          // Skip if already processed as category/destination blog
          log(`  🔍 Checking standalone blog ID: ${blogDoc._id}`)
          log(`  🔍 Is in processedBlogIds? ${processedBlogIds.has(blogDoc._id)}`)

          if (processedBlogIds.has(blogDoc._id)) {
            log(`  ⏭️  ⏭️  ⏭️  SKIPPING ${blogDoc.title} - already processed as category/destination blog`)
            continue
          }

          log(`  ✓ Adding standalone blog to batch`)
          currentBatch.push({...blogDoc})

          // Commit batch if it reaches the limit
          if (currentBatch.length >= BATCH_SIZE) {
            await commitBatch(currentBatch, batchNumber, client, true) // use createOrReplace for standalone
            currentBatch = []
            batchNumber++
          }
        }
      }
    } catch (err) {
      reporter.recordFailure('content/blog', err.message)
      error(`❌ Failed to process content/blog directory:`, err.message)
    }

    // Commit any remaining blog posts in the final batch
    if (currentBatch.length > 0) {
      log(`\n⏳ Committing final batch ${batchNumber} (${currentBatch.length} posts)...`)
      log(`   🔍 DEBUG BEFORE COMMIT - All documents in final batch:`)
      currentBatch.forEach((doc, idx) => {
        log(`      [${idx}] ${doc.title.substring(0, 40)}... | categorySlug="${doc.categorySlug || 'NULL'}" | destinationSlug="${doc.destinationSlug || 'NULL'}" | testField="${doc.testMigrationField || 'NULL'}"`)
      })
      try {
        const tx = client.transaction()
        currentBatch.forEach((doc) => tx.createOrReplace(doc))
        await tx.commit()
        log(`✅ Final batch committed successfully!`)
      } catch (commitErr) {
        error('❌ Final batch commit failed:', commitErr.message)
        error('   Full error:', commitErr)
        throw commitErr
      }
    }

    log(`\n${'='.repeat(50)}`)
    log('Blog posts migration completed!')
    reporter.printSummary()

    return reporter
  } catch (err) {
    error('❌ Blog migration failed:', err.message)
    error('Full error:', err)
    reporter.printSummary()
    throw err
  }
}
