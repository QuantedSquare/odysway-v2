// Titre et photo Sanity des voyages de l'Espace Voyageur, par slug.
// Le miroir AC ne porte qu'un titre de deal ; Sanity donne le vrai nom du
// voyage et sa photo de couverture.
const IMAGE_DEFAUT = '/images/default/Odysway-couverture-mongolie.jpeg'

export const useEspaceVoyages = () => {
  const sanity = useSanity()
  const voyages = useState('espace-voyages-sanity', () => ({}))

  const charger = async (slugs) => {
    const manquants = [...new Set(slugs.filter(Boolean))].filter(s => !(s in voyages.value))
    if (!manquants.length) return
    try {
      const lignes = await sanity.fetch(
        groq`*[_type == "voyage" && slug.current in $slugs]{ "slug": slug.current, title, image }`,
        { slugs: manquants },
      )
      const suite = { ...voyages.value }
      for (const s of manquants) suite[s] = null
      for (const l of lignes || []) suite[l.slug] = l
      voyages.value = suite
    }
    catch (err) {
      // Sans Sanity, l'espace garde le titre AC et la photo par défaut.
      console.error('[espace] voyages Sanity', err?.message)
    }
  }

  const voyage = slug => (slug ? voyages.value[slug] || null : null)
  const titre = dossier => voyage(dossier?.slug)?.title || dossier?.titre || 'Votre voyage'
  const image = (dossier, largeur = 600) => getImageUrl(voyage(dossier?.slug)?.image?.asset?._ref, null, null, largeur) || IMAGE_DEFAUT

  return { charger, voyage, titre, image }
}
