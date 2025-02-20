export default defineNuxtRouteMiddleware(async (to) => {
  const route = useRoute()
  const query = { dealId: route.query.orderId, step: 1 }
  if (route.query.isSold === 'true') {
    Object.assign(query, { type: 'balance' })
  }
  else if (route.query.acompte === 'true') {
    Object.assign(query, { type: 'deposit' })
  }
  else {
    Object.assign(query, { type: 'custom', amount: route.query.amount })
  }
  console.log('old payment link redirection query:', query)
  return navigateTo({
    path: '/checkout',
    query: query })
})
