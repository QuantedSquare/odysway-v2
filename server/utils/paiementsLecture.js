// Paiements d'un deal relus chez Stripe et chez Alma. Partagé par le Docteur
// d'Ulysse (/api/v1/ulysse/deals/:dealId/paiements) et l'Espace Voyageur.
//
// LECTURE SEULE. Stripe : PaymentIntents dont les métadonnées portent le deal
// (`payment_intent_data.metadata` de createCheckoutSession), virements en
// attente compris. Alma : paiements rattachés au deal dans `alma_ids`, relus
// chez Alma. Chaque source échoue seule : l'autre reste lisible.

const STRIPE_MAX = 100

const lireStripe = async (dealId) => {
  const intents = []
  let page = null
  do {
    const r = await stripeCLI.paymentIntents.search({
      query: `metadata['dealId']:'${dealId}'`,
      expand: ['data.latest_charge'],
      limit: 100,
      ...(page ? { page } : {}),
    })
    intents.push(...r.data)
    page = r.has_more ? r.next_page : null
  } while (page && intents.length < STRIPE_MAX)
  return paiementsDeal.resumerStripe(intents)
}

const lireAlma = async (dealId) => {
  const { data, error } = await supabase.from('alma_ids').select('id').eq('deal_id', dealId)
  if (error) throw new Error(error.message)
  const paiements = await Promise.all((data || []).map(r => alma.lirePaiement(r.id)))
  return paiementsDeal.resumerAlma(paiements)
}

const source = async (lire, contexte) => {
  try {
    return { disponible: true, ...(await lire()) }
  }
  catch (err) {
    console.error(`[${contexte}/paiements]`, err?.message)
    return { disponible: false, erreur: err?.message || String(err), paiements: [], encaisse: null, enAttente: null }
  }
}

/** { stripe, alma } — chacun `{ disponible, paiements, encaisse, enAttente }`. */
const lirePaiements = async (dealId, contexte = 'paiements') => {
  const [stripe, almaPaiements] = await Promise.all([
    source(() => lireStripe(dealId), contexte),
    source(() => lireAlma(dealId), contexte),
  ])
  return { stripe, alma: almaPaiements }
}

/**
 * Journal des encaissements hors ligne d'Ulysse (`ulysse.encaissements`) :
 * chèques vacances, chèques, virements directs saisis par l'équipe. Pour
 * l'Espace Voyageur seulement (le Docteur lit son journal lui-même).
 * `{ disponible, lignes }` — lignes brutes, triées par espaceVoyageur.ligneEncaissement.
 */
const lireEncaissements = async (dealId, contexte = 'paiements') => {
  try {
    const { data, error } = await supabase.schema('ulysse').from('encaissements')
      .select('montant, moyen, origine, statut, recu_le, ac_le, archived')
      .eq('deal_id', dealId)
      .eq('archived', false)
    if (error) throw new Error(error.message)
    return { disponible: true, lignes: data || [] }
  }
  catch (err) {
    console.error(`[${contexte}/encaissements]`, err?.message)
    return { disponible: false, lignes: [] }
  }
}

export default { lirePaiements, lireEncaissements }
