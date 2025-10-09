/* eslint-env node */
import {fromMarkdown} from 'mdast-util-from-markdown'
import {log, error} from 'node:console'
import yaml from 'js-yaml'

/**
 * Convert Nuxt Content markdown with custom components to Sanity Portable Text
 * @param {string} markdown - The markdown content to convert
 * @param {Map<string, string>} assetMapping - Image path to asset ID mapping
 * @returns {Array} Portable Text blocks
 */
export async function convertMarkdownToPortableText(markdown, assetMapping) {
  try {
    // Step 1: Remove frontmatter (already handled as separate fields)
    let content = removeFrontmatter(markdown)

    // Step 2: Convert custom image-container components BEFORE stripping wrappers
    // (needs the closing :: markers to be intact)
    content = await convertImageContainers(content, assetMapping)

    // Step 3: Strip custom wrapper components
    content = stripCustomWrappers(content)

    // Step 4: Convert remaining markdown to Portable Text
    const portableText = await convertToPortableText(content)

    return portableText
  } catch (err) {
    error('Error converting markdown to Portable Text:', err.message)
    throw err
  }
}

/**
 * Remove YAML frontmatter from markdown
 */
function removeFrontmatter(markdown) {
  // Remove frontmatter between --- delimiters
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, '')
}

/**
 * Strip custom Nuxt Content wrapper components
 */
function stripCustomWrappers(markdown) {
  let content = markdown

  // Remove ::blog-hero-section with its content
  content = content.replace(/::blog-hero-section[\s\S]*?::/g, '')

  // Remove ::section-container but keep the content inside
  // Pattern: ::section-container\n#content\n... content ...\n::
  content = content.replace(/::section-container\s*\n#content\s*\n/g, '')

  // Remove ::color-container blocks manually by tracking nesting depth
  content = removeColorContainers(content)

  // Remove closing :: markers
  content = content.replace(/^::$/gm, '')

  // Remove any remaining slot markers like #title, #introduction, #content
  content = content.replace(/^#\w+\s*$/gm, '')

  // Clean up extra newlines
  content = content.replace(/\n{3,}/g, '\n\n')

  return content.trim()
}

/**
 * Remove ::color-container blocks with proper nesting handling
 */
function removeColorContainers(markdown) {
  const lines = markdown.split('\n')
  const result = []
  let inColorContainer = false
  let depth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check if we're starting a color-container
    if (trimmed.match(/^::color-container(\{[^}]*\})?$/)) {
      inColorContainer = true
      depth = 0
      continue
    }

    if (inColorContainer) {
      // Track nesting with :: components
      if (trimmed.match(/^::[a-z-]+/)) {
        // Opening a nested component (e.g., ::info-container, ::cta-button)
        depth++
      } else if (trimmed === '::') {
        // Closing marker
        if (depth === 0) {
          // This closes the color-container itself
          inColorContainer = false
          continue
        } else {
          // This closes a nested component
          depth--
        }
      }
      // Skip all lines inside color-container
      continue
    }

    result.push(line)
  }

  return result.join('\n')
}

/**
 * Convert ::image-container or :::image-container components to markdown images
 * This allows the standard MD parser to handle them
 */
async function convertImageContainers(markdown, assetMapping) {
  // Pattern to match image-container blocks with 2 or 3 colons and flexible whitespace
  const imageContainerPattern = /::+image-container[\s\S]*?---[\s\S]*?\n([\s\S]*?)\n[\s]*---[\s\S]*?::+/g

  let matchCount = 0
  const result = markdown.replace(imageContainerPattern, (_match, yamlContent) => {
    matchCount++
    try {
      // Parse the YAML content
      const data = yaml.load(yamlContent)
      const imageSrc = data['image-src'] || data.imageSrc
      const alt = data.alt || ''

      if (!imageSrc) {
        log(`⚠️  Image container without image-src, skipping`)
        return ''
      }

      // Look up the asset ID from the mapping (with filename fallback for duplicates)
      let assetId = assetMapping.get(imageSrc)

      // Fallback: try by filename for deduplicated images
      if (!assetId && assetMapping.filenameMapping) {
        const filename = imageSrc.split('/').pop()
        const duplicates = assetMapping.filenameMapping.get(filename)
        if (duplicates && duplicates.length > 0) {
          assetId = duplicates[0].id
          log(`🔄 Using deduplicated image: ${imageSrc} -> ${duplicates[0].path}`)
        }
      }

      if (!assetId) {
        log(`⚠️  Image not found in assets: ${imageSrc}`)
        return '' // Remove the image if not found
      }

      // Store the asset reference in a custom format that we'll parse later
      // Use a unique marker with zero-width characters to avoid markdown parsing
      return `\n\n\u200B\u200BSANITY_IMAGE\u200B${JSON.stringify({assetId, alt})}\u200B\u200B\n\n`
    } catch (err) {
      error(`Error parsing image-container YAML:`, err.message)
      return '' // Skip invalid image containers
    }
  })

  if (matchCount > 0) {
    log(`  🖼️  Converted ${matchCount} image containers`)
  }

  return result
}

/**
 * Convert markdown to Portable Text using mdast
 */
async function convertToPortableText(markdown) {
  try {
    // Parse markdown to MDAST (Markdown Abstract Syntax Tree)
    const mdast = fromMarkdown(markdown)

    // Transform MDAST to Portable Text
    const portableText = mdastToPortableText(mdast)

    return portableText
  } catch (err) {
    error('Error in markdown conversion:', err.message)
    throw err
  }
}

/**
 * Transform MDAST to Portable Text format
 */
function mdastToPortableText(mdast) {
  const blocks = []

  function processNode(node, marks = []) {
    switch (node.type) {
      case 'root':
        node.children.forEach((child) => processNode(child))
        break

      case 'paragraph': {
        const children = []
        node.children.forEach((child) => {
          const result = processInline(child, marks)
          if (Array.isArray(result)) {
            children.push(...result)
          } else if (result) {
            children.push(result)
          }
        })

        // Check if this paragraph is actually a Sanity image marker
        if (children.length === 1 && typeof children[0].text === 'string') {
          const match = children[0].text.match(/\u200B\u200BSANITY_IMAGE\u200B(.+?)\u200B\u200B/)
          if (match) {
            const imageData = JSON.parse(match[1])
            blocks.push({
              _type: 'image',
              _key: generateKey(),
              asset: {
                _type: 'reference',
                _ref: imageData.assetId,
              },
              alt: imageData.alt || '',
            })
            break // Don't create a text block for the marker
          }
        }

        if (children.length > 0) {
          blocks.push({
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children,
            markDefs: [],
          })
        }
        break
      }

      case 'heading': {
        const children = []
        node.children.forEach((child) => {
          const result = processInline(child, marks)
          if (Array.isArray(result)) {
            children.push(...result)
          } else if (result) {
            children.push(result)
          }
        })

        if (children.length > 0) {
          blocks.push({
            _type: 'block',
            _key: generateKey(),
            style: `h${node.depth}`,
            children,
            markDefs: [],
          })
        }
        break
      }

      case 'blockquote': {
        node.children.forEach((child) => {
          if (child.type === 'paragraph') {
            const children = []
            child.children.forEach((inline) => {
              const result = processInline(inline, marks)
              if (Array.isArray(result)) {
                children.push(...result)
              } else if (result) {
                children.push(result)
              }
            })

            if (children.length > 0) {
              blocks.push({
                _type: 'block',
                _key: generateKey(),
                style: 'blockquote',
                children,
                markDefs: [],
              })
            }
          }
        })
        break
      }

      case 'list': {
        // For now, convert lists to paragraphs with bullets
        // You can enhance this later
        node.children.forEach((item) => {
          if (item.type === 'listItem') {
            item.children.forEach((child) => processNode(child))
          }
        })
        break
      }

      default:
        // Skip unknown node types
        break
    }
  }

  function processInline(node, marks = []) {
    switch (node.type) {
      case 'text':
        return {
          _type: 'span',
          _key: generateKey(),
          text: node.value,
          marks: marks.length > 0 ? marks : undefined,
        }

      case 'strong': {
        const children = []
        node.children.forEach((child) => {
          const result = processInline(child, [...marks, 'strong'])
          // Flatten arrays
          if (Array.isArray(result)) {
            children.push(...result)
          } else if (result) {
            children.push(result)
          }
        })
        return children
      }

      case 'emphasis': {
        const children = []
        node.children.forEach((child) => {
          const result = processInline(child, [...marks, 'em'])
          // Flatten arrays
          if (Array.isArray(result)) {
            children.push(...result)
          } else if (result) {
            children.push(result)
          }
        })
        return children
      }

      case 'link': {
        const markKey = generateKey()
        const children = []

        node.children.forEach((child) => {
          const result = processInline(child, marks)
          // Flatten arrays (e.g., from nested strong/emphasis)
          if (Array.isArray(result)) {
            children.push(...result)
          } else if (result) {
            children.push(result)
          }
        })

        // Add link mark to all children and attach markDef
        return children.map((child) => ({
          ...child,
          marks: [...(child.marks || []), markKey],
          _markDef: {
            _key: markKey,
            _type: 'link',
            href: node.url,
          },
        }))
      }

      case 'inlineCode':
        return {
          _type: 'span',
          _key: generateKey(),
          text: node.value,
          marks: [...marks, 'code'],
        }

      default:
        return null
    }
  }

  processNode(mdast)

  // Post-process: Extract markDefs from children
  blocks.forEach((block) => {
    if (block._type === 'block' && block.children) {
      const markDefs = []
      block.children.forEach((child) => {
        if (child._markDef) {
          markDefs.push(child._markDef)
          delete child._markDef
        }
      })
      block.markDefs = markDefs
    }
  })

  return blocks
}

/**
 * Generate a unique key for Portable Text blocks
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11)
}
