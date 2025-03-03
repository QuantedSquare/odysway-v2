import { useRoute, useRouter } from 'vue-router'

export function useParams() {
  const route = useRoute()
  const router = useRouter()

  function addMultipleParams(params) {
    const currentParams = { ...route.query }
    const newQuery = { ...currentParams, ...params }

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

  function addSingleParam(paramName, paramValue) {
    return addMultipleParams({ [paramName]: paramValue })
  }

  return {
    addMultipleParams,
    addSingleParam,
  }
}
