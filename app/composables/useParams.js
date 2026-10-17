import { useRoute, useRouter } from 'vue-router'

// vue-router ne met à jour `route.query` qu'à la fin d'une navigation, et une
// navigation lancée avant cette fin annule la précédente. Deux mises à jour
// rapprochées partaient donc toutes deux de l'ancienne URL : le booked_id posé
// par la reprise d'une réservation (ou le kickstart) puis step=2 donnaient
// `?date_id=…&step=2` sans booked_id, et l'étape Voyageurs restait bloquée sur
// « Continuer » grisé (immersion-armoni, 12-14/10/2026). Chaque mise à jour part
// désormais de la dernière URL demandée. Une entrée par routeur : côté serveur,
// un routeur par requête.
const requetesEnVol = new WeakMap()

export function useParams() {
  const route = useRoute()
  const router = useRouter()

  function addMultipleParams(params, { replace = false } = {}) {
    const currentParams = { ...(requetesEnVol.get(router) || route.query) }
    const newQuery = { ...currentParams, ...params }

    const filteredParams = Object.keys(newQuery).reduce((acc, key) => {
      if (newQuery[key] !== null && newQuery[key] !== undefined) {
        acc[key] = newQuery[key]
      }
      return acc
    }, {})

    requetesEnVol.set(router, filteredParams)
    const location = { path: route.path, query: filteredParams }
    return (replace ? router.replace(location) : router.push(location)).finally(() => {
      if (requetesEnVol.get(router) === filteredParams) requetesEnVol.delete(router)
    })
  }

  function addSingleParam(paramName, paramValue) {
    return addMultipleParams({ [paramName]: paramValue })
  }
  function removeParam(paramName) {
    const currentParams = { ...route.query }
    delete currentParams[paramName]
    return addMultipleParams(currentParams)
  }

  return {
    addMultipleParams,
    addSingleParam,
    removeParam,

  }
}
