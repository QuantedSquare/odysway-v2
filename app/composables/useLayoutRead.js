/**
 * Utility composable to batch layout reads and avoid forced reflow
 * Uses requestAnimationFrame to batch layout property reads
 */
export function useLayoutRead() {
  /**
   * Schedule a layout read operation in the next animation frame
   * This batches multiple layout reads together, avoiding forced reflow
   * @param {Function} callback - Function that reads layout properties
   * @returns {Promise} Resolves with the result of the callback
   */
  const scheduleLayoutRead = (callback) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const result = callback()
        resolve(result)
      })
    })
  }

  /**
   * Read scrollHeight safely without causing forced reflow
   * @param {Ref|HTMLElement} elementRef - Element reference or HTML element
   * @returns {Promise<number>} The scrollHeight value
   */
  const readScrollHeight = (elementRef) => {
    const element = unref(elementRef)
    if (!element) return Promise.resolve(0)

    return scheduleLayoutRead(() => element.scrollHeight)
  }

  /**
   * Read offsetWidth safely without causing forced reflow
   * @param {Ref|HTMLElement} elementRef - Element reference or HTML element
   * @returns {Promise<number>} The offsetWidth value
   */
  const readOffsetWidth = (elementRef) => {
    const element = unref(elementRef)
    if (!element) return Promise.resolve(0)

    return scheduleLayoutRead(() => element.offsetWidth)
  }

  /**
   * Read multiple layout properties at once
   * @param {Ref|HTMLElement} elementRef - Element reference or HTML element
   * @param {Array<string>} properties - Array of property names to read
   * @returns {Promise<Object>} Object with property values
   */
  const readLayoutProperties = (elementRef, properties) => {
    const element = unref(elementRef)
    if (!element) return Promise.resolve({})

    return scheduleLayoutRead(() => {
      const result = {}
      properties.forEach((prop) => {
        result[prop] = element[prop]
      })
      return result
    })
  }

  return {
    scheduleLayoutRead,
    readScrollHeight,
    readOffsetWidth,
    readLayoutProperties,
  }
}
