/**
 * Converts Portable Text blocks to plain text string
 * @param {Array} portableTextBlocks - Array of Portable Text blocks from Sanity
 * @returns {string} Plain text content
 */
import { stegaClean } from '@sanity/client/stega'

export function portableTextToPlain(portableTextBlocks) {
  if (!portableTextBlocks || !Array.isArray(portableTextBlocks)) {
    return ''
  }

  const textParts = []

  const extractText = (blocks) => {
    for (const block of blocks) {
      // Handle regular text blocks
      if (block._type === 'block' && block.children) {
        const blockText = block.children
          .filter(child => child.text)
          .map(child => child.text)
          .join('')

        if (blockText.trim()) {
          textParts.push(blockText.trim())
        }
      }

      // Handle callout blocks with nested content
      if (block._type === 'callout' && block.content) {
        extractText(block.content)
      }

      // Handle code blocks
      if (block._type === 'codeBlock' && block.code) {
        textParts.push(block.code.trim())
      }

      // Handle list items
      if (block.listItem && block.children) {
        const listText = block.children
          .filter(child => child.text)
          .map(child => child.text)
          .join('')

        if (listText.trim()) {
          textParts.push(listText.trim())
        }
      }
    }
  }

  extractText(portableTextBlocks)

  // Join with spaces and clean up multiple spaces
  return stegaClean(textParts.join('\n\n').replace(/\n+/g, '\n').trim())
}
