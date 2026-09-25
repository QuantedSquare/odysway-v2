// Réécrit la ligne miroir d'un deal depuis l'API AC, par la même fonction de
// correspondance que le webhook et la resynchronisation (dealMirror.js).
//
// Sert aux écritures d'Ulysse (corrections du Docteur, encaissements) : le
// webhook AC suivra, mais Ulysse relit le miroir aussitôt et doit y voir sa
// correction, pas l'ancienne valeur.
//
// LECTURE SEULE côté AC.

// Libellés que le webhook reçoit dans sa charge mais que l'API REST ne donne
// qu'en identifiants : étapes, pipelines, propriétaires.
/** Le deal AC et ses champs personnalisés mappés, fusionnés comme les lit tout le code. */
const lireDeal = async (dealId) => {
  const [{ deal }, champs] = await Promise.all([activecampaign.getDealById(dealId), activecampaign.getDealCustomFields(dealId)])
  return { deal, champs, fusion: { ...deal, ...champs } }
}

const lireLibelles = async () => {
  const [etapes, pipelines, utilisateurs] = await Promise.all([
    activecampaign.listStages(),
    activecampaign.listPipelines(),
    activecampaign.listUsers(),
  ])
  const parId = (lignes, libelle) => Object.fromEntries((lignes || []).map(l => [String(l.id), libelle(l)]))
  return {
    stages: parId(etapes?.dealStages, l => l.title),
    pipelines: parId(pipelines?.dealGroups, l => l.title),
    owners: parId(utilisateurs?.users, l => `${l.firstName || ''} ${l.lastName || ''}`.trim() || null),
  }
}

/** Relit le deal AC (sauf s'il vient d'être lu : `lu`) et réécrit sa ligne miroir. Rend la ligne écrite. */
const resynchroniserDeal = async (dealId, { lookups, lu } = {}) => {
  const [{ deal }, champs, libelles] = await Promise.all([
    lu ? Promise.resolve({ deal: lu.deal }) : activecampaign.getDealById(dealId),
    lu ? Promise.resolve(lu.champs) : activecampaign.getDealCustomFields(dealId),
    lookups ? Promise.resolve(lookups) : lireLibelles(),
  ])
  const ligne = dealMirror.mapDealToMirrorRow({
    dealId,
    contactId: Number(deal.contact),
    fetchedDeal: { ...deal, ...champs },
    lookups: libelles,
  })
  const { error } = await supabase.from('activecampaign_deals').upsert(ligne, { onConflict: 'id' })
  if (error) throw new Error(`Miroir non mis à jour : ${error.message}`)
  return ligne
}

export default {
  lireDeal,
  lireLibelles,
  resynchroniserDeal,
}
