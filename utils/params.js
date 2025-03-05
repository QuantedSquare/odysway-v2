import { useRoute, useRouter } from 'vue-router'

/**
 * Adds multiple query parameters to the current route
 * @param {Object} queryParams - Object containing query parameters to add/update
 */
export function addMultipleParams(params) {
  const route = useRoute()
  const router = useRouter()
  console.log('route in addMultiple', route)
  const currentParams = { ...route.query }

  // Merge current query with new query parameters
  const newQuery = { ...currentParams, ...params }

  // Filter out null/undefined values
  const filteredParams = Object.keys(newQuery).reduce((acc, key) => {
    if (newQuery[key] !== null && newQuery[key] !== undefined) {
      acc[key] = newQuery[key]
    }
    return acc
  }, {})

  return router.push({
    path: route.path,
    query: filteredParams,
  })
}

/**
 * Add a single query parameter to the current route
 * @param {string} queryName - Name of the query parameter
 * @param {any} queryValue - Value of the query parameter
 */
export function addSingleParam(paramName, paramValue) {
  return addMultipleParams({ [paramName]: paramValue })
}

export default {
  addMultipleParams,
  addSingleParam,
}
