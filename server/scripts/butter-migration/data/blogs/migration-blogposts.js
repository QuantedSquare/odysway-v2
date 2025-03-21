import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// Configure Turndown to handle special cases
turndownService.addRule('imageCenter', {
  filter: (node) => {
    return node.nodeName === 'IMG'
      && node.hasAttribute('style')
      && node.getAttribute('style').includes('display: block; margin-left: auto; margin-right: auto;')
  },
  replacement: (content, node) => {
    const src = node.getAttribute('src')
    const alt = node.getAttribute('alt') || ''
    return `::image-container\n---\nimage-src: ${src}\n---\n::`
  },
})

// Add custom rule for all images
turndownService.addRule('images', {
  filter: 'img',
  replacement: function (content, node) {
    const src = node.getAttribute('src')
    const alt = node.getAttribute('alt') || ''
    return `::image-container\n---\nimage-src: ${src}\n---\n::`
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
 * Convert Buttercms post to Nuxt Content markdown
 * @param {Object} post - Buttercms post object
 * @returns {String} - Markdown content for Nuxt Content
 */
function convertButtercmsToNuxtContent(post) {
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
author: "${post.author}"
published: ${post.published === 'published'}
publishedAt: "${post.published}"
tags: ${formatTags}
categories: ${formatCategories}
displayedImg: "${post.featured_image || ''}"
---

::hero-section-blog
---
image-src: "${post.featured_image || ''}"
---
#publication-date
${new Date(post.published).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}

#title
${post.title}

#introduction
${introduction}
::

::section-container
---
image-src: "${post.featured_image || ''}"
---
#content
${markdown}
::
`

  return formattedMarkdown
}

/**
 * Process a Buttercms API response and convert all posts to Nuxt Content format
 * @param {String} inputFile - Path to the Buttercms API response JSON file
 * @param {String} outputDir - Directory to save the converted markdown files
 */
function processButtercmsPosts(inputFile, outputDir) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Read and parse the input file
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

  // Process each post
  if (Array.isArray(data)) {
    data.forEach(post => processPost(post, outputDir))
  }
  else {
    // If it's a single post or wrapped in an object
    processPost(data, outputDir)
  }
}

/**
 * Process a single post
 * @param {Object} post - Buttercms post object
 * @param {String} outputDir - Directory to save the converted markdown file
 */
function processPost(post, outputDir) {
  const markdown = convertButtercmsToNuxtContent(post)
  const outputFile = path.join(outputDir, `${post.slug}.md`)
  fs.writeFileSync(outputFile, markdown)
  console.log(`Converted ${post.title} to ${outputFile}`)
}

// Extract images from HTML and save them to the public directory
async function extractAndSaveImages(htmlContent, outputDir) {
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
  let match
  const images = []

  while ((match = imageRegex.exec(htmlContent)) !== null) {
    images.push(match[1])
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Download and save images
  for (const imageUrl of images) {
    try {
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()
      const fileName = path.basename(imageUrl)
      const outputPath = path.join(outputDir, fileName)

      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log(`Saved image: ${fileName}`)
    }
    catch (error) {
      console.error(`Error downloading image ${imageUrl}: ${error.message}`)
    }
  }
}

// Example usage
const inputFile = 'blogposts.json'
const outputDir = './content/blog'
const imagesDir = './public/images/blog'

processButtercmsPosts(inputFile, outputDir)
