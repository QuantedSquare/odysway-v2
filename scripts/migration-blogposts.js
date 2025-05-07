import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import slugify from 'slugify'
import axios from 'axios'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// Image download configuration
const IMAGE_DOWNLOAD_DIR = '../public/images/blogs'
const DOWNLOAD_DELAY_MS = 100 // 500ms delay between downloads
const MAX_RETRIES = 3 // Maximum number of retry attempts
const RETRY_DELAY_MS = 2000 // Wait 2 seconds before retrying

// Helper function to create a delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Configure Turndown to handle special cases with our local image paths
turndownService.addRule('imageCenter', {
  filter: (node) => {
    return node.nodeName === 'IMG'
      && node.hasAttribute('style')
      && node.getAttribute('style').includes('display: block; margin-left: auto; margin-right: auto;')
  },
  replacement: (content, node) => {
    const src = node.getAttribute('src')
    const alt = node.getAttribute('alt') || ''
    const parentLink = node.parentElement
    const link = parentLink && parentLink.nodeName === 'A' ? parentLink.getAttribute('href') : null

    if (link) {
      return `::image-container\n---\nimage-src: ${src}\nalt: ${alt}\nlink: ${link}\n---\n::`
    }

    return `::image-container\n---\nimage-src: ${src}\nalt: ${alt}\n---\n::`
  },
})

// Add custom rule for all images
turndownService.addRule('images', {
  filter: 'img',
  replacement: function (content, node) {
    const src = node.getAttribute('src')
    const alt = node.getAttribute('alt') || ''
    const parentLink = node.parentElement
    const link = parentLink && parentLink.nodeName === 'A' ? parentLink.getAttribute('href') : null

    if (link) {
      return `::image-container\n---\nimage-src: ${src}\nalt: ${alt}\nlink: ${link}\n---\n::`
    }

    return `::image-container\n---\nimage-src: ${src}\nalt: ${alt}\n---\n::`
  },
})

// Add a rule to handle links that contain images
turndownService.addRule('linkWithImage', {
  filter: (node) => {
    return node.nodeName === 'A' && node.querySelector('img')
  },
  replacement: (content) => {
    // Just return the content (which will be processed by the image rule)
    return content
  },
})

/**
 * Formats a string for YAML, handling special characters and multi-line strings
 * @param {String} str - String to format for YAML
 * @returns {String} - YAML-safe string
 */
function formatYamlString(str) {
  if (!str) return '""'

  // Check if string contains line breaks
  if (str.includes('\n')) {
    // Use YAML's literal block scalar (|) for multi-line strings
    // This preserves line breaks and indentation
    return `|\n    ${str.replace(/\n/g, '\n    ')}`
  }

  // For single-line strings with special characters, use double quotes
  return `"${str.replace(/"/g, '\\"')}"`
}

/**
 * Download an image with retry logic
 * @param {String} imageUrl - URL of the image to download
 * @param {String} outputPath - Path to save the image
 * @param {Number} retryCount - Current retry attempt
 * @returns {Promise<String>} - Local path to the downloaded image
 */
async function downloadImage(imageUrl, outputPath, retryCount = 0) {
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Check if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`Image already exists at: ${outputPath}`)
    return outputPath
  }

  try {
    console.log(`Downloading image: ${imageUrl}`)
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })

    if (!response.data) {
      throw new Error('Failed to download image: No data received')
    }

    fs.writeFileSync(outputPath, response.data)
    console.log(`Saved image to: ${outputPath}`)
    return outputPath
  }
  catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Error downloading image, retrying (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`)
      await sleep(RETRY_DELAY_MS)
      return downloadImage(imageUrl, outputPath, retryCount + 1)
    }
    else {
      console.error(`Failed to download image after ${MAX_RETRIES} attempts: ${imageUrl}`)
      throw error
    }
  }
}

/**
 * Generate a filename for the downloaded image
 * @param {String} imageUrl - URL of the image
 * @param {String} altText - Alt text of the image
 * @returns {String} - Filename for the image
 */
function generateImageFilename(imageUrl) {
  // Parse the URL to get the original filename extension
  const urlObj = new URL(imageUrl)
  const originalFilename = path.basename(urlObj.pathname)
  const extension = path.extname(originalFilename)

  // If no extension is found, default to .jpg
  if (extension.length === 0) {
    console.log('No extension found for image: ', urlObj)
    return `${originalFilename}.jpg`
  }
  return originalFilename
}

/**
 * Process and download all images in a post
 * @param {Object} post - Buttercms post object
 * @returns {Promise<Object>} - Object containing mappings from original URLs to local paths
 */
async function processAndDownloadImages(post) {
  // Create image directory if it doesn't exist
  if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) {
    fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true })
  }

  const postSlug = slugify(post.slug, { lower: true })
  const postDir = path.join(IMAGE_DOWNLOAD_DIR, postSlug)
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true })
  }

  const imageUrlMap = new Map()
  const imagesToProcess = []

  // Add featured image if it exists
  if (post.featured_image && post.featured_image.trim() !== '') {
    imagesToProcess.push({
      url: post.featured_image,
      alt: post.title || '', // Use post title as alt for featured image if no specific alt is available
    })
  }

  // Parse HTML to find all image tags with their alt text
  const dom = new JSDOM(post.body)
  const imgElements = dom.window.document.querySelectorAll('img')

  imgElements.forEach((img) => {
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ''

    if (src) {
      // Check if this image URL is already in our list
      const existingImageIndex = imagesToProcess.findIndex(item => item.url === src)

      if (existingImageIndex === -1) {
        // New image, add it to the list
        imagesToProcess.push({ url: src, alt: alt })
      }
      else if (alt && !imagesToProcess[existingImageIndex].alt) {
        // Update alt text if the existing entry doesn't have one
        imagesToProcess[existingImageIndex].alt = alt
      }
    }
  })

  // Download each image with rate limiting
  for (const image of imagesToProcess) {
    try {
      // Generate a filename based on alt text if available, or URL otherwise
      const filename = generateImageFilename(image.url)

      // Check if a file with this name already exists and make it unique if needed
      // let uniqueFilename = filename
      // let counter = 1
      // while (fs.existsSync(path.join(IMAGE_DOWNLOAD_DIR, uniqueFilename))) {
      //   const ext = path.extname(filename)
      //   const baseName = path.basename(filename, ext)
      //   uniqueFilename = `${baseName}-${counter}${ext}`
      //   counter++
      // }

      const outputPath = path.join(postDir, filename)

      // Download the image
      await downloadImage(image.url, outputPath)

      // Map original URL to local path
      const relativePath = `/images/blogs/${postSlug}/${filename}`
      imageUrlMap.set(image.url, relativePath)

      // Apply rate limiting
      await sleep(DOWNLOAD_DELAY_MS)
    }
    catch (error) {
      console.error(`Error processing image ${image.url}: ${error.message}`)
      // Continue with other images even if one fails
    }
  }

  return imageUrlMap
}

/**
 * Replace image URLs in markdown with local paths
 * @param {String} markdown - Markdown content
 * @param {Map} imageUrlMap - Map of original URLs to local paths
 * @returns {String} - Updated markdown content
 */
function replaceImageUrls(markdown, imageUrlMap) {
  let updatedMarkdown = markdown

  // Replace image URLs in image-container components
  imageUrlMap.forEach((localPath, originalUrl) => {
    const regex = new RegExp(`image-src: ${escapeRegExp(originalUrl)}`, 'g')
    updatedMarkdown = updatedMarkdown.replace(regex, `image-src: "${localPath}"`)
  })

  return updatedMarkdown
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param {String} string - String to escape
 * @returns {String} - Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Convert Buttercms post to Nuxt Content markdown
 * @param {Object} post - Buttercms post object
 * @param {Map} imageUrlMap - Map of original URLs to local paths
 * @returns {String} - Markdown content for Nuxt Content
 */
function convertButtercmsToNuxtContent(post, imageUrlMap) {
  // Create a virtual DOM with jsdom
  const dom = new JSDOM(post.body)
  const document = dom.window.document

  // Extract the first paragraph as introduction
  const firstParagraph = document.querySelector('p:not(:empty)')
  const introduction = firstParagraph ? firstParagraph.textContent : ''

  // Convert HTML to Markdown
  let markdown = turndownService.turndown(post.body)

  // Manually replace any remaining standard markdown image syntax
  markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, '::image-container\n---\nimage-src: $2\n---\n::')

  // Remove any link wrapping around image-container components
  markdown = markdown.replace(/\[(::image-container[\s\S]*?::)\]\((.*?)\)/g, '$1')

  // Clean up image-container components with Markdown formatting
  markdown = markdown.replace(/([_*]+)::image-container/g, '::image-container')
  markdown = markdown.replace(/::image-container([_*]+)/g, '::image-container')

  // Remove any underscores that appear after the image-container component
  markdown = markdown.replace(/::image-container\n---\nimage-src: (.*?)\n---\n::_/g, '::image-container\n---\nimage-src: $1\n---\n::')

  // General fix for any underscores after image-container components
  markdown = markdown.replace(/::image-container[\s\S]*?::_/g, match => match.replace(/_$/, ''))

  // Replace all image URLs with local paths
  markdown = replaceImageUrls(markdown, imageUrlMap)

  // Get featured image local path
  const featuredImagePath = post.featured_image
    ? (imageUrlMap.get(post.featured_image) || post.featured_image)
    : ''

  // Format arrays properly
  const formatTags = Array.isArray(post.tags)
    ? `[${post.tags.map(tag => `"${tag}"`).join(', ')}]`
    : `"${post.tags}"`

  const formatCategories = Array.isArray(post.categories)
    ? `[${post.categories.map(cat => `"${cat}"`).join(', ')}]`
    : `"${post.categories}"`

  // Format the markdown with Nuxt Content components
  const formattedMarkdown = `---
title: "${post.title}"
description: ${formatYamlString(post.summary)}
seo:
  title: "${post.seo_title}"
  description: ${formatYamlString(post.meta_description)}
navigation:
  title: "${post.title}"
  description: ${formatYamlString(post.summary)}
author: "${post.author === 'romain.masina@odysway.com' ? 'Romain Masina' : 'Linda Tran'}"
authorPhoto: ${post.author === 'romain.masina@odysway.com' ? '/images/team/romain.webp' : '/images/team/linda.jpeg'}
authorRole: ${post.author === 'romain.masina@odysway.com' ? 'Fondateur Odysway' : 'Co-fondatrice Odysway'}
published: ${post.published === 'published'}
publishedAt: "${post.published}"
tags: ${formatTags}
categories: ${formatCategories}
displayedImg: "${featuredImagePath}"
blogType: "Actu"
badgeColor: "secondary"
readingTime: "3"
---

::blog-hero-section
---
background-color: soft-blush
title-color: primary
introduction-color: grey
avatar-size: '60'
---
#title
${post.title}

#introduction
${post.summary}
::

::section-container
#content
${markdown}
::
::color-container
---
color: soft-blush
---
  ::info-container
  #title
  Découvrir les voyages coups de coeur
  #description
  Partez à la découverte de destinations qui nous ont conquis.
  #bottom
  ::cta-button
  ---
  link: /
  color: secondary
  ---
  #text
  Découvrir
  ::
  ::
::

::color-container
---
color: grey-light-2
---
  ::blog-cards-container
  ---
  blogCardSlug1: '/blog/sejour-arts-martiaux' 
  blogCardSlug2: '/blog/vin-ou-comment-decouvrir-france-patrimoine-viticole' 
  blogCardSlug3: '/blog/voyage-insolite-nos-idees-devasion-pour-tous' 
  ---
  #title
  Ça devrait vous plaire
  #cta-button
    ::cta-button
    ---
    color: white
    textColor: primary
    link: '/blog'
    ---
    #text
    Tous les  articles
    ::
  ::
`
  return formattedMarkdown
}

/**
 * Process a Buttercms API response and convert all posts to Nuxt Content format
 * @param {String} inputFile - Path to the Buttercms API response JSON file
 * @param {String} outputDir - Directory to save the converted markdown files
 */
async function processButtercmsPosts(inputFile, outputDir) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Read and parse the input file
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

  // Process each post
  if (Array.isArray(data)) {
    for (const post of data) {
      await processPostWithImages(post, outputDir)
      // Add a small delay between posts to avoid rate limiting
      await sleep(DOWNLOAD_DELAY_MS)
    }
  }
  else {
    // If it's a single post or wrapped in an object
    await processPostWithImages(data, outputDir)
  }
}

/**
 * Process a single post including downloading its images
 * @param {Object} post - Buttercms post object
 * @param {String} outputDir - Directory to save the converted markdown file
 */
async function processPostWithImages(post, outputDir) {
  console.log(`Processing post: ${post.title}`)

  try {
    // Process and download all images
    const imageUrlMap = await processAndDownloadImages(post)

    // Convert post to markdown with updated image paths
    const markdown = convertButtercmsToNuxtContent(post, imageUrlMap)

    // Write markdown file
    const outputFile = path.join(outputDir, `${post.slug}.md`)
    fs.writeFileSync(outputFile, markdown)

    console.log(`Converted ${post.title} to ${outputFile}`)
  }
  catch (error) {
    console.error(`Error processing post ${post.title}: ${error.message}`)
  }
}

const inputFile = './butter-data/blogposts.json'
const outputDir = '../content/blog'

// Run the main function
processButtercmsPosts(inputFile, outputDir).catch((err) => {
  console.error('Error processing posts:', err)
})
