export const createId = (prefix, str ) => {
  return `${prefix}-${str.normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`
}