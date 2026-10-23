// Règles du compte de l'Espace Voyageur : suppression (RGPD).
//
// PUR et SANS IMPORT : Nitro résout mal un import vers app/ (chemin calculé
// depuis .nuxt/dev). C'est le navigateur qui importe ce fichier
// (app/utils/espaceReglesCompte.js), pour appliquer la même double
// confirmation. Testé par tests/unit/espaceCompte.test.mjs. Les accès à la
// base sont dans espaceComptes.js.

// Mot à saisir pour confirmer : la seconde confirmation, après la case cochée.
const MOT_SUPPRESSION = 'SUPPRIMER'
// Même fraîcheur que pour poser un mot de passe (app/utils/espaceMotDePasse.js).
const FRAICHEUR_MINUTES = 10

const normaliserEmail = v => String(v || '').trim().toLowerCase()

/**
 * Double confirmation : la case « je comprends ce qui est conservé » cochée,
 * et le mot SUPPRIMER saisi (casse et espaces de bordure indifférents).
 */
const confirmationValide = corps =>
  corps?.conservationComprise === true
  && String(corps?.confirmation || '').trim().toUpperCase() === MOT_SUPPRESSION

/**
 * La connexion date-t-elle de moins de 10 minutes ? Lit `amr` dans le jeton
 * (déjà vérifié par supabase.auth.getUser) : l'âge de la CONNEXION, qui
 * survit aux rafraîchissements, pas celui du jeton.
 */
const connexionRecente = (jeton, maintenantMs = Date.now(), minutes = FRAICHEUR_MINUTES) => {
  let charge = null
  try {
    charge = JSON.parse(Buffer.from(String(jeton || '').split('.')[1] || '', 'base64url').toString('utf8'))
  }
  catch {
    return false
  }
  const amr = charge?.amr
  if (!Array.isArray(amr) || !amr.length) return false
  const derniere = Math.max(...amr.map(e => Number(e?.timestamp) || 0))
  return derniere > 0 && maintenantMs - derniere * 1000 <= minutes * 60 * 1000
}

/**
 * Le compte appartient-il à l'équipe ? Lignes de `ulysse.members` trouvées par
 * user_id OU par email : un membre jamais connecté à Ulysse n'a pas encore de
 * user_id. Comparaison exacte de l'email (le `ilike` de la requête ne sert qu'à
 * ignorer la casse). Actif ou non : un compte d'équipe ne se supprime jamais
 * depuis l'espace client.
 */
const estMembreEquipe = (lignes, { id, email }) => {
  const e = normaliserEmail(email)
  return (lignes || []).some(m => (id && m?.user_id === id) || (e && normaliserEmail(m?.email) === e))
}

/**
 * Ce que la suppression efface : les profils que ce compte a remplis POUR LUI
 * (`traveler_profiles.user_id`), avec leurs copies de pièce. Les profils que le
 * titulaire a remplis pour ses proches restent : ce sont leurs données, et le
 * voyage en a besoin.
 */
const profilsAEffacer = (profils, userId) =>
  (profils || []).filter(p => userId && p?.user_id === userId)
    .map(p => ({ placeId: p.deal_traveler_id, scanPath: p.scan_path || null }))

export default {
  MOT_SUPPRESSION,
  FRAICHEUR_MINUTES,
  confirmationValide,
  connexionRecente,
  estMembreEquipe,
  profilsAEffacer,
}
