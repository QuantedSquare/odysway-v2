/**
 * Extracts plain text content from Portable Text blocks and returns the total character count
 * @param {Array} portableTextBlocks - Array of Portable Text blocks from Sanity
 * @returns {number} Total character count of all text content
 */
export function getPortableTextLength(portableTextBlocks) {
  if (!portableTextBlocks || !Array.isArray(portableTextBlocks)) {
    return 0
  }

  let totalLength = 0

  const extractText = (blocks) => {
    for (const block of blocks) {
      // Handle regular text blocks
      if (block._type === 'block' && block.children) {
        for (const child of block.children) {
          if (child.text) {
            totalLength += child.text.length
          }
        }
      }

      // Handle callout blocks with nested content
      if (block._type === 'callout' && block.content) {
        extractText(block.content)
      }

      // Handle code blocks
      if (block._type === 'codeBlock' && block.code) {
        totalLength += block.code.length
      }

      // Handle list items (if they exist)
      if (block.listItem && block.children) {
        for (const child of block.children) {
          if (child.text) {
            totalLength += child.text.length
          }
        }
      }
    }
  }

  extractText(portableTextBlocks)
  return totalLength
}

/**
 * Checks if Portable Text content exceeds a certain character threshold
 * @param {Array} portableTextBlocks - Array of Portable Text blocks from Sanity
 * @param {number} threshold - Character count threshold
 * @returns {boolean} True if content exceeds threshold
 */
export function shouldTruncatePortableText(portableTextBlocks, threshold = 700) {
  const length = getPortableTextLength(portableTextBlocks)
  return length > threshold
}
