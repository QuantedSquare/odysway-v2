// Fige l'attribution d'un deal au moment où le prospect laisse son email.
//
// Appelé par les deux routes qui créent un deal depuis le site (POST /ac/deals :
// devis, newsletter, tunnel ; POST /booking/:slug/date/:dateId/kickstart :
// tunnel). Relit les cookies d'attribution de la requête (attribution.js) et
// insère la ligne `deal_attribution`. La première écriture gagne : un deal garde
// la source qu'il avait à sa naissance.
//
// Ne lève jamais : une attribution perdue ne doit pas faire échouer un devis.

import { parseCookies } from 'h3'
import supabase from './supabase'
import attribution from './attribution'

const enregistrer = async (event, dealId, formulaire) => {
  if (!dealId) return null
  try {
    const ligne = attribution.ligneAttribution({ dealId, formulaire, cookies: parseCookies(event) })
    const { error } = await supabase
      .from('deal_attribution')
      .upsert(ligne, { onConflict: 'deal_id', ignoreDuplicates: true })
    if (error) {
      console.error(`[attribution] deal ${dealId} : écriture refusée`, error.message || error)
      return null
    }
    console.log(`[attribution] deal ${dealId} : ${ligne.first_channel ?? 'inconnu'} → ${ligne.last_channel ?? 'inconnu'}`)
    return ligne
  }
  catch (err) {
    console.error(`[attribution] deal ${dealId} : échec`, err?.message || err)
    return null
  }
}

export default { enregistrer }
