import { createClient } from '@sanity/client'

// Un voyage est en portage quand Sanity le marque `portage` et qu'il est
// « sur-mesure » seul (cms/schemaTypes/voyageType.ts). Ses inscrits vont dans la
// pipeline AC 7 (server/utils/pipelines.js).

/**
 * `false` si Sanity ne répond pas : le deal naît alors en pipeline 1, comme
 * avant, plutôt que de faire échouer l'inscription. L'équipe le déplace à la main.
 */
const estVoyagePortage = async (slug) => {
  if (!slug) return false
  // Tout dans le try : l'appelant peut lancer la lecture sans l'attendre, elle
  // ne doit jamais rejeter.
  try {
    const config = useRuntimeConfig()
    const client = createClient({
      projectId: config.public.sanity.projectId,
      dataset: config.public.sanity.dataset,
      apiVersion: config.public.sanity.apiVersion,
      useCdn: false,
    })
    return await client.fetch(
      'count(*[_type == "voyage" && slug.current == $slug && portage == true && count(availabilityTypes) == 1 && "custom" in availabilityTypes]) > 0',
      { slug },
    )
  }
  catch (err) {
    console.error(`[portage] lecture Sanity impossible pour ${slug}:`, err instanceof Error ? err.message : err)
    return false
  }
}

export default { estVoyagePortage }
