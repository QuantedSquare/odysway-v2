export default function (queryName, queryValue) {
  const route = useRoute()
  const router = useRouter()
  const currentQuery = { ...route.query }
  // If incoming queryName already exist in current , we replace with new.
  // If not we add it after the current query.
  const newQuery = { ...currentQuery, [queryName]: queryValue }

  const filteredQuery = Object.keys(newQuery).reduce((acc, key) => {
    if (newQuery[key] !== null && newQuery[key] !== undefined) {
      acc[key] = newQuery[key]
    }
    return acc
  }, {})

  router.push({
    path: route.path,
    query: filteredQuery,
  })
}
