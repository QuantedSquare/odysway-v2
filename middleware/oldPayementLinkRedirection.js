export default defineNuxtRouteMiddleware(async (to) => {
  const route = useRoute()
  const query = { dealId: route.query.orderId, step: 1 }
  //  #TODO Ajouter logic : Si dealId => Créer une date dans supabase
  //  => Rediriger vers checkout _booked_id avec le type en bout
  // Faire attention à si la date existe déjà, on la récupère uniquement grâce au dealId
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
