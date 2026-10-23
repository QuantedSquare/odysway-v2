import { createError } from 'h3'

// Compte de l'Espace Voyageur : appartenance à l'équipe, suppression (RGPD).
// Règles pures dans espaceCompte.js.
//
// La suppression efface ce que le client a saisi pour lui-même, puis le compte
// Supabase Auth. Le reste suit les clés étrangères (vérifiées en base) :
//   - client_account_links, client_link_codes, trip_document_views : CASCADE ;
//   - deal_travelers.user_id / invited_by, traveler_profiles.user_id /
//     updated_by, traveler_file_access.acteur_user_id : SET NULL.
// Les deals AC, réservations et paiements ne bougent pas (obligation comptable).

const echec = (error, contexte) => {
  if (!error) return
  console.error(`[espace/compte] ${contexte}`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Suppression impossible pour le moment. Réessayez dans un instant.' })
}

/** Le compte est-il celui d'un membre d'Ulysse ? En cas de doute (erreur), oui. */
const estMembreEquipe = async (client) => {
  const [parId, parEmail] = await Promise.all([
    supabase.schema('ulysse').from('members').select('user_id, email').eq('user_id', client.id),
    supabase.schema('ulysse').from('members').select('user_id, email').ilike('email', espaceVoyageur.motifEmailExact(client.email)),
  ])
  if (parId.error || parEmail.error) {
    console.error('[espace/compte] lecture de ulysse.members', (parId.error || parEmail.error).message)
    return true
  }
  return espaceCompte.estMembreEquipe([...(parId.data || []), ...(parEmail.data || [])], client)
}

/**
 * Supprime le compte. Les données sont effacées AVANT le compte : une fois le
 * compte parti, plus rien ne relie un profil à cette personne. Si la
 * suppression du compte échoue, le client relance : tout est rejouable.
 * @returns {{ profilsEffaces: number, copiesEffacees: number }}
 */
const supprimerCompte = async (client) => {
  const { data: profils, error } = await supabase.from('traveler_profiles')
    .select('deal_traveler_id, user_id, scan_path').eq('user_id', client.id)
  echec(error, 'profils du compte')
  const aEffacer = espaceCompte.profilsAEffacer(profils, client.id)

  // Copies de pièces : fichiers d'abord, puis les lignes (une ligne sans
  // fichier vaut mieux qu'un fichier sans ligne, que la purge ne trouverait plus).
  const chemins = aEffacer.map(p => p.scanPath).filter(Boolean)
  if (chemins.length) {
    const { error: e } = await supabase.storage.from(espaceProfils.BUCKET).remove(chemins)
    echec(e, 'copies de pièces')
  }
  if (aEffacer.length) {
    const { error: e } = await supabase.from('traveler_profiles').delete()
      .eq('user_id', client.id).in('deal_traveler_id', aEffacer.map(p => p.placeId))
    echec(e, 'profils')
    // Une ligne par profil effacé ; scan_path renseigné si une copie l'était aussi.
    for (const p of aEffacer) await espaceProfils.journal(p.placeId, 'suppression', client, p.scanPath)
  }

  // Le consentement « visible par le groupe » était celui de la personne.
  const { error: e2 } = await supabase.from('deal_travelers')
    .update({ visible_groupe: false, updated_at: new Date().toISOString() })
    .eq('user_id', client.id).eq('visible_groupe', true)
  echec(e2, 'consentement groupe')

  // Suppression définitive (pas `shouldSoftDelete`) : l'adresse redevient libre.
  const { error: e3 } = await supabase.auth.admin.deleteUser(client.id)
  echec(e3, 'compte Supabase Auth')

  console.log(`[espace/compte] compte ${client.id} supprimé (${aEffacer.length} profil(s), ${chemins.length} copie(s))`)
  return { profilsEffaces: aEffacer.length, copiesEffacees: chemins.length }
}

export default { estMembreEquipe, supprimerCompte }
