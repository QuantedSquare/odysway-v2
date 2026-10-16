// Fige l'attribution d'un deal au moment où le prospect laisse son email.
//
// Appelé par les deux routes qui créent un deal depuis le site (POST /ac/deals :
// devis, newsletter, tunnel ; POST /booking/:slug/date/:dateId/kickstart :
// tunnel). Relit les cookies d'attribution de la requête (attribution.js) et
// insère la ligne `deal_attribution`. La première écriture gagne : un deal garde
// la source qu'il avait à sa naissance.
//
// Ne lève jamais : une attribution perdue ne doit pas faire échouer un devis.
// Retourne la ligne calculée, même si l'écriture a échoué : l'événement lead
// (conversionsDeal.lead) en a besoin dans tous les cas.

import { getHeader, getRequestIP, parseCookies } from 'h3'
import supabase from './supabase'
import attribution from './attribution'

const enregistrer = async (event, dealId, formulaire) => {
  if (!dealId) return null
  let ligne = null
  try {
    ligne = attribution.ligneAttribution({
      dealId,
      formulaire,
      cookies: parseCookies(event),
      requete: { ip: getRequestIP(event, { xForwardedFor: true }), userAgent: getHeader(event, 'user-agent') },
    })
    const ecrire = l => supabase
      .from('deal_attribution')
      .upsert(l, { onConflict: 'deal_id', ignoreDuplicates: true })
    let { error } = await ecrire(ligne)
    // Code déployé avant la migration 20261013100000 : colonnes du visiteur
    // encore inconnues (PGRST204). On garde l'attribution, sans elles.
    if (error?.code === 'PGRST204') {
      const sansVisiteur = Object.fromEntries(Object.entries(ligne)
        .filter(([cle]) => cle !== 'client_ip' && cle !== 'client_user_agent'))
      console.warn(`[attribution] deal ${dealId} : colonnes du visiteur absentes, migration 20261013100000 à appliquer`)
      const reprise = await ecrire(sansVisiteur)
      error = reprise.error
    }
    if (error) {
      console.error(`[attribution] deal ${dealId} : écriture refusée`, error.message || error)
      return ligne
    }
    console.log(`[attribution] deal ${dealId} : ${ligne.first_channel ?? 'inconnu'} → ${ligne.last_channel ?? 'inconnu'}`)
    return ligne
  }
  catch (err) {
    console.error(`[attribution] deal ${dealId} : échec`, err?.message || err)
    return ligne
  }
}

export default { enregistrer }
