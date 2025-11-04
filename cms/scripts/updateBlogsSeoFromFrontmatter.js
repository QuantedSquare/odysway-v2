import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {log, error} from 'node:console'
import yaml from 'js-yaml'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'

const BLOG_DIR = '../content/blog'
const CATEGORIES_DIR = '../content/categories'
const DESTINATIONS_DIR = '../content/destinations'

function extractFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
  const match = markdown.match(frontmatterRegex)
  if (!match) return null
  try {
    return yaml.load(match[1])
  } catch (err) {
    error('Error parsing frontmatter:', err.message)
    return null
  }
}

function loadMarkdownBySlug(slug) {
  // 1) try standalone blog
  const standalonePath = path.join(BLOG_DIR, `${slug}.md`)
  if (fs.existsSync(standalonePath)) {
    return {mdPath: standalonePath, context: 'blog'}
  }

  // 2) try categories
  if (fs.existsSync(CATEGORIES_DIR)) {
    const categoryDirs = fs.readdirSync(CATEGORIES_DIR, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name)
    for (const dir of categoryDirs) {
      const candidate = path.join(CATEGORIES_DIR, dir, `${slug}.md`)
      if (fs.existsSync(candidate)) {
        return {mdPath: candidate, context: `categories/${dir}`}
      }
    }
  }

  // 3) try destinations
  if (fs.existsSync(DESTINATIONS_DIR)) {
    const destinationDirs = fs.readdirSync(DESTINATIONS_DIR, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name)
    for (const dir of destinationDirs) {
      const candidate = path.join(DESTINATIONS_DIR, dir, `${slug}.md`)
      if (fs.existsSync(candidate)) {
        return {mdPath: candidate, context: `destinations/${dir}`}
      }
    }
  }

  return null
}

function buildSeoObject(frontmatter, assetMapping) {
  const seoFm = frontmatter?.seo || {}
  const seo = {}

  if (seoFm.title) seo.metaTitle = seoFm.title
  if (seoFm.description) seo.metaDescription = seoFm.description
  if (seoFm.canonicalUrl) seo.canonicalUrl = seoFm.canonicalUrl
  if (seoFm.focusKeyword) seo.focusKeyword = seoFm.focusKeyword
  if (Array.isArray(seoFm.keywords)) seo.keywords = seoFm.keywords.filter(Boolean)
  if (typeof seoFm.robotsIndex === 'boolean') seo.robotsIndex = seoFm.robotsIndex
  if (typeof seoFm.robotsFollow === 'boolean') seo.robotsFollow = seoFm.robotsFollow
  if (seoFm.ogTitle) seo.ogTitle = seoFm.ogTitle
  if (seoFm.ogDescription) seo.ogDescription = seoFm.ogDescription

  // Optional image resolution if provided
  if (seoFm.ogImage && assetMapping) {
    const imageRef = convertImageReference(seoFm.ogImage, assetMapping, seoFm.ogImageAlt || '')
    if (imageRef) {
      seo.ogImage = imageRef
    }
  }

  return seo
}

export async function updateSingleBlogSeo(client, slug) {
  try {
    log(`\n🧪 Updating SEO for single blog by slug: ${slug}`)

    const match = loadMarkdownBySlug(slug)
    if (!match) {
      throw new Error(`Markdown not found for slug "${slug}" in blog/categories/destinations`)
    }

    const mdContent = fs.readFileSync(match.mdPath, 'utf8')
    const frontmatter = extractFrontmatter(mdContent)
    if (!frontmatter) {
      throw new Error(`No frontmatter found in ${match.mdPath}`)
    }

    const assetMapping = await buildImageAssetMapping(client)
    const seo = buildSeoObject(frontmatter, assetMapping)

    if (Object.keys(seo).length === 0) {
      log('⚠️  No SEO fields found in frontmatter; skipping update.')
      return {updated: false, reason: 'no-seo-fields'}
    }

    const blog = await client.fetch('*[_type == "blog" && slug.current == $slug][0]{_id, title}', {slug})
    if (!blog) {
      throw new Error(`Sanity blog not found for slug "${slug}"`)
    }

    log(`✅ Found blog: ${blog.title} (${blog._id}) — patching seo`)
    await client.patch(blog._id).set({seo}).commit()

    log('✨ SEO updated successfully for single blog')
    return {updated: true, _id: blog._id}
  } catch (err) {
    error('❌ Failed to update single blog SEO:', err.message)
    throw err
  }
}

export default async function updateBlogsSeoFromFrontmatter(client) {
  log('Starting batch update of blog SEO from frontmatter...')

  const assetMapping = await buildImageAssetMapping(client)

  // Collect all candidate markdown files with their slugs
  const candidates = []

  // standalone blogs
  if (fs.existsSync(BLOG_DIR)) {
    const mdFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
    for (const file of mdFiles) {
      candidates.push({slug: file.replace('.md', ''), mdPath: path.join(BLOG_DIR, file)})
    }
  }

  // category blogs
  if (fs.existsSync(CATEGORIES_DIR)) {
    const categoryDirs = fs.readdirSync(CATEGORIES_DIR, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name)
    for (const dir of categoryDirs) {
      const dirPath = path.join(CATEGORIES_DIR, dir)
      const mdFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'))
      for (const file of mdFiles) {
        candidates.push({slug: file.replace('.md', ''), mdPath: path.join(dirPath, file)})
      }
    }
  }

  // destination blogs
  if (fs.existsSync(DESTINATIONS_DIR)) {
    const destinationDirs = fs.readdirSync(DESTINATIONS_DIR, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name)
    for (const dir of destinationDirs) {
      const dirPath = path.join(DESTINATIONS_DIR, dir)
      const mdFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'))
      for (const file of mdFiles) {
        candidates.push({slug: file.replace('.md', ''), mdPath: path.join(dirPath, file)})
      }
    }
  }

  log(`Found ${candidates.length} markdown candidates to check for SEO data`)

  // Fetch all blogs once (slug -> _id)
  const blogs = await client.fetch('*[_type == "blog"]{_id, title, slug}')
  const blogIdBySlug = new Map()
  blogs.forEach((b) => {
    const s = b?.slug?.current
    if (s) blogIdBySlug.set(s, {id: b._id, title: b.title})
  })
  log(`Loaded ${blogIdBySlug.size} blogs from Sanity`)

  let updated = 0
  let skipped = 0
  let missing = 0

  // Use a transaction batch for efficiency
  let tx = client.transaction()
  let txCount = 0
  const BATCH_SIZE = 50

  for (const {slug, mdPath} of candidates) {
    const blog = blogIdBySlug.get(slug)
    if (!blog) {
      missing++
      continue
    }

    const mdContent = fs.readFileSync(mdPath, 'utf8')
    const frontmatter = extractFrontmatter(mdContent)
    if (!frontmatter) {
      skipped++
      continue
    }

    const seo = buildSeoObject(frontmatter, assetMapping)
    if (Object.keys(seo).length === 0) {
      skipped++
      continue
    }

    tx.patch(blog.id, {set: {seo}})
    txCount++
    updated++

    if (txCount >= BATCH_SIZE) {
      log(`\n⏳ Committing batch of ${txCount} SEO updates...`)
      await tx.commit()
      log('✅ Batch committed')
      tx = client.transaction()
      txCount = 0
    }
  }

  if (txCount > 0) {
    log(`\n⏳ Committing final batch of ${txCount} SEO updates...`)
    await tx.commit()
    log('✅ Final batch committed')
  }

  log(`\nDone. Updated: ${updated}, Skipped (no SEO/frontmatter): ${skipped}, Missing blogs by slug: ${missing}`)

  return {updated, skipped, missing}
}


