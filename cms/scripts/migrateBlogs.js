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

    // Start a transaction for batch operations
    const tx = client.transaction()

    for (const dir of categoryDirs) {
      try {
        // Look for markdown files in each directory
        const dirPath = path.join(categoriesFolderPath, dir)
        const mdFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.md'))

        if (mdFiles.length === 0) {
          log(`  ℹ️  No markdown files found in ${dir}`)
          continue
        }

        log(`\n📁 Processing category: ${dir}`)
        log(`  Found ${mdFiles.length} markdown file(s)`)

        // Process each markdown file as a blog post
        for (const mdFile of mdFiles) {
          reporter.incrementTotal()

          try {
            const mdPath = path.join(dirPath, mdFile)
            const mdContent = fs.readFileSync(mdPath, 'utf8')

            // Extract frontmatter from markdown
            const frontmatter = extractFrontmatter(mdContent)

            if (!frontmatter) {
              reporter.recordWarning(`${dir}/${mdFile}`, 'No frontmatter found in markdown')
              log(`  ⚠️  No frontmatter in ${mdFile}`)
              continue
            }

            if (!frontmatter.title) {
              reporter.recordWarning(`${dir}/${mdFile}`, 'No title in frontmatter')
              log(`  ⚠️  No title in ${mdFile}`)
              continue
            }

            // Generate a unique ID from the title
            const blogID = createId('blog', frontmatter.title)

            log(`\n  📝 ${frontmatter.title}`)

            // Prepare the blog document for Sanity
            const blogDoc = {
              _id: blogID,
              _type: 'blog',
              title: frontmatter.title,
              slug: {
                current: mdFile.replace('.md', ''),
              },
              description: frontmatter.description || '',
              published: frontmatter.published !== undefined ? frontmatter.published : true,
            }

            // Extract all frontmatter fields
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
            if (frontmatter.navigation?.description)
              blogDoc.navigationDescription = frontmatter.navigation.description

            // Handle tags
            if (frontmatter.tags) {
              if (typeof frontmatter.tags === 'string' && frontmatter.tags.trim()) {
                blogDoc.tags = frontmatter.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              } else if (Array.isArray(frontmatter.tags)) {
                blogDoc.tags = frontmatter.tags.filter(Boolean)
              }
            }

            // Link author to team member by first name
            if (frontmatter.author) {
              const firstName = frontmatter.author.split(' ')[0].trim()
              const authorQuery = `*[_type == "teamMember" && name match $firstName][0]._id`
              const authorId = await client.fetch(authorQuery, {firstName: `${firstName}*`})

              if (authorId) {
                blogDoc.author = {
                  _type: 'reference',
                  _ref: authorId,
                }
                log(`    ✓ Linked author: ${frontmatter.author} → ${firstName}`)
              } else {
                reporter.recordWarning(blogID, `Team member not found for author: ${frontmatter.author}`)
                log(`    ⚠️  Author not found: ${frontmatter.author}`)
              }
            }

            // Handle displayedImg (featured image)
            if (frontmatter.displayedImg && frontmatter.displayedImg.trim() !== '') {
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

            // Convert markdown content to Portable Text
            log(`    📝 Converting content...`)
            const portableTextBody = await convertMarkdownToPortableText(mdContent, assetMapping)

            if (portableTextBody && portableTextBody.length > 0) {
              blogDoc.body = portableTextBody
              log(`    ✓ Converted ${portableTextBody.length} content blocks`)

              // Save conversion as test sample
              const testDir = path.join(process.cwd(), 'scripts', 'test')
              if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, {recursive: true})
              }

              const sampleOutput = {
                blog: frontmatter.title,
                category: dir,
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
            } else {
              reporter.recordWarning(blogID, 'No content blocks generated')
              log(`    ⚠️  No content blocks generated`)
            }

            // Add to transaction
            tx.createOrReplace(blogDoc)
            reporter.recordSuccess()
            log(`    ✅ Blog post prepared`)
          } catch (err) {
            reporter.recordFailure(`${dir}/${mdFile}`, err.message)
            error(`    ❌ Failed to process ${mdFile}:`, err.message)
          }
        }
      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process directory ${dir}:`, err.message)
      }
    }

    // Commit the transaction
    log(`\n⏳ Committing all blog posts to Sanity...`)
    try {
      const result = await tx.commit()
      log(`✅ Transaction committed successfully!`)
      log(`   Results:`, JSON.stringify(result, null, 2))
    } catch (commitErr) {
      error('❌ Transaction commit failed:', commitErr.message)
      error('   Full error:', commitErr)
      throw commitErr
    }

    log(`✅ Successfully migrated blog posts to Sanity!`)

    // Generate and save report
    reporter.finish()
  } catch (err) {
    error('Error during migration:', err.message)
    error('Full error details:', err)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
