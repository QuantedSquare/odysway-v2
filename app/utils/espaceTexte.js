// Petites règles de français de l'Espace Voyageur.

/** « d'Inès », « de Paul », « de ce voyageur ». */
export const dePrenom = (prenom) => {
  const p = String(prenom || '').trim()
  if (!p) return 'de ce voyageur'
  return /^[aeiouyhàâäéèêëîïôöùûü]/i.test(p) ? `d'${p}` : `de ${p}`
}
