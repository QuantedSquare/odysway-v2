import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'
import { convertMarkdownToPortableText } from './markdownToPortableText.js'

const categoriesFolderPath = '../content/categories'

export default async function migrateCategories(client) {
  // Create reporter
  const reporter = new MigrationReporter('categories')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting categories migration...`)

    // Read all category directories
    const categoryDirs = fs.readdirSync(categoriesFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    log(`Found ${categoryDirs.length} category directories to migrate`)

    // Start a transaction for batch operations
    const tx = client.transaction()
    
    for (const dir of categoryDirs) {
      reporter.incrementTotal()

      try {
        // Look for JSON and MD files in each directory
        const dirPath = path.join(categoriesFolderPath, dir);
        const jsonFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
        const mdFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

        if (jsonFiles.length === 0) {
          reporter.recordWarning(dir, 'No JSON files found in directory')
          log(`⚠️  No JSON files found in ${dir}`)
          continue;
        }

        // Process the first JSON file found (assuming one per directory)
        const jsonFile = jsonFiles[0];
        const jsonPath = path.join(dirPath, jsonFile);
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Generate a unique ID from the title
        const categoryID = createId('category', data.title)

        // Prepare the category document for Sanity
        const categoryDoc = {
          _id: categoryID,
          _type: 'category',
          title: data.title,
          slug: {
            current: data.slug
          },
          discoveryTitle: data.discoveryTitle,
          seoTitle: data.seoTitle,
          description: data.description,
          showOnHome: data.showOnHome,
          published: true, // Default to published
        }

        // Handle image from JSON
        if (data?.image?.src && data.image.src.trim() !== '') {
          const imageRef = convertImageReference(
            data.image.src,
            assetMapping,
            data.image.alt || data.title,
            reporter,
            categoryID
          )

          if (imageRef) {
            categoryDoc.image = imageRef
            log(`  📷 Image: ${data.image.src} -> ${imageRef.asset._ref}`)
          } else {
            log(`  ⚠️  Image not found in assets: ${data.image.src}`)
          }
        } else if (!data?.image || !data.image.src) {
          reporter.recordWarning(categoryID, 'No image provided')
        }

        // Process markdown file if exists
        if (mdFiles.length > 0) {
          const mdFile = mdFiles[0];
          const mdPath = path.join(dirPath, mdFile);
          const mdContent = fs.readFileSync(mdPath, 'utf8');

          log(`  📝 Converting markdown to Portable Text...`)

          // Convert markdown to Portable Text
          const portableTextBody = await convertMarkdownToPortableText(mdContent, assetMapping)

          if (portableTextBody && portableTextBody.length > 0) {
            categoryDoc.body = portableTextBody
            log(`  ✅ Converted ${portableTextBody.length} content blocks`)

            // Save conversion as test sample
            const testDir = path.join(process.cwd(), 'scripts', 'test')
            if (!fs.existsSync(testDir)) {
              fs.mkdirSync(testDir, { recursive: true })
            }

            const sampleOutput = {
              category: data.title,
              originalMarkdown: mdContent,
              portableText: portableTextBody,
              conversionNotes: [
                'Frontmatter stripped - handled as separate Sanity fields',
                'Custom wrappers (::blog-hero-section, ::section-container) removed',
                ':::image-container converted to Portable Text image blocks',
                'Images linked to Sanity assets via asset mapping',
                'Standard markdown (bold, italic, links, headings, quotes) converted'
              ]
            }

            const sanitizedFilename = data.slug.replace(/[^a-z0-9-]/g, '-')
            fs.writeFileSync(
              path.join(testDir, `conversion-${sanitizedFilename}.json`),
              JSON.stringify(sampleOutput, null, 2)
            )
            log(`  💾 Sample saved to scripts/test/conversion-${sanitizedFilename}.json`)
          }

          // TODO: Extract additional fields from MD frontmatter if needed
          // (author, publishedAt, tags, etc.)
        } else {
          reporter.recordWarning(categoryID, 'No markdown content file found')
          log(`  ⚠️  No markdown file found for ${data.title}`)
        }

        // Add to transaction
        tx.createOrReplace(categoryDoc)
        reporter.recordSuccess()
        log(`✅ Prepared category: ${data.title} (ID: ${categoryID})`)

      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process ${dir}:`, err.message)
      }
    }
    
    // Commit the transaction
    await tx.commit()
    log(`✅ Successfully migrated ${categoryDirs.length} categories to Sanity!`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during migration:', err.message);
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

