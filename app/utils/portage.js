// Voyages « sur-mesure » seuls : hors listings, recherche et sitemap, vendus sur
// une page accessible uniquement par lien quand elle est publiée dans Sanity.
// Un voyage en portage (séjour d'un accompagnateur externe porté par Odysway)
// en est un, avec le drapeau `portage` : sa page vit sur /portage/<slug>.

export const estSurMesureSeul = (voyage) => {
  const types = voyage?.availabilityTypes
  return Array.isArray(types) && types.length === 1 && types[0] === 'custom'
}

export const estVoyagePortage = voyage => estSurMesureSeul(voyage) && voyage?.portage === true

export const estPagePortage = voyage => estVoyagePortage(voyage) && voyage?.customPagePublished === true
