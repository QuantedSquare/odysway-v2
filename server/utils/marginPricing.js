import supabase from './supabase'

// =========================================================================
// Grille tarifaire : coût d'achat et prix de vente, d'où la marge est dérivée.
// Voir supabase/migrations/20260917120000_margins_v4_purchase_cost.sql.
// =========================================================================
//
// Écrit par Ulysse (jeton de service), jamais par l'ancien éditeur. Fichier à
// part, et non dans margins.js, à dessein : margins.js est lu par le tableau de
// bord, la fiche date et l'éditeur actuel, et doit continuer à fonctionner sans
// modification. Rien ici ne change la façon dont une marge se RÉSOUT : on écrit
// `margin_per_traveler` comme l'ancien éditeur, plus les colonnes d'où elle vient.
//
// La dérivation (prix − frais − single − coût) n'est PAS refaite ici : elle vit
// dans Ulysse (domain/grille.ts), qui envoie la marge dérivée avec ses entrées.
// Dupliquer la formule dans deux dépôts, c'est la garantie de les voir diverger ;
// la réconciliation d'Ulysse recalcule chaque ligne à partir de ce qui est stocké.
//
// Export par défaut objet, comme margins et softDelete : auto-importé par nitro
// sous le nom `marginPricing`.

const GRID_MODELS = ['gir', 'privatif']
const CURRENCIES = ['EUR', 'USD']
const BASES = ['entered', 'purchase_cost']

const SETTINGS_COLUMNS = 'voyage_slug, config_mode, child_margin_delta, grid_model, purchase_currency, single_supplement, bank_fees_pct, target_margin_pct, margin_basis, pricing_updated_at, pricing_updated_by'
const ROW_COLUMNS = 'pax, year, season_id, margin_per_traveler, purchase_cost_per_traveler, sale_price_per_traveler, fx_rate, pricing_updated_at, updated_at, updated_by'

const badRequest = (message) => {
  const err = new Error(message)
  err.statusCode = 400
  return err
}

// `undefined` = champ absent (ne pas toucher) ; `null` ou '' = effacer.
const optionalNumber = (value, label, { min = -Infinity, strictMin = false, max = Infinity } = {}) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || (strictMin ? n <= min : n < min) || n >= max) {
    throw badRequest(`${label} invalide : ${value}`)
  }
  return n
}

const requiredNumber = (value, label, options) => {
  const n = optionalNumber(value, label, options)
  if (n === null || n === undefined) throw badRequest(`${label} requis`)
  return n
}

/**
 * Paramètres tarifaires du voyage. Ne touche ni `config_mode` ni l'écart
 * enfant, que l'ancien éditeur écrit par settings.put.js.
 */
const upsertPricingSettings = async (voyageSlug, input, editorEmail) => {
  const update = {
    voyage_slug: voyageSlug,
    pricing_updated_at: new Date().toISOString(),
    pricing_updated_by: editorEmail || null,
  }

  if (input.grid_model !== undefined) {
    if (input.grid_model !== null && !GRID_MODELS.includes(input.grid_model)) {
      throw badRequest(`grid_model doit être ${GRID_MODELS.join(', ')} ou null`)
    }
    update.grid_model = input.grid_model
  }
  if (input.purchase_currency !== undefined) {
    if (!CURRENCIES.includes(input.purchase_currency)) {
      throw badRequest(`purchase_currency doit être ${CURRENCIES.join(', ')}`)
    }
    update.purchase_currency = input.purchase_currency
  }

  const single = optionalNumber(input.single_supplement, 'single_supplement', { min: 0 })
  if (single !== undefined) update.single_supplement = single
  const fees = optionalNumber(input.bank_fees_pct, 'bank_fees_pct', { min: 0, max: 100 })
  if (fees !== undefined) update.bank_fees_pct = fees
  const target = optionalNumber(input.target_margin_pct, 'target_margin_pct', { min: 0, strictMin: true })
  if (target !== undefined) update.target_margin_pct = target

  const { data, error } = await supabase
    .from('voyage_margin_settings')
    .upsert(update, { onConflict: 'voyage_slug' })
    .select(SETTINGS_COLUMNS)
    .single()

  if (error) throw error
  return data
}

/**
 * Lignes d'une année × saison : coût, prix, change et marge dérivée.
 *
 * `season_id` null vise les lignes « toutes saisons ». Une saison doit appartenir
 * au voyage et ne pas être supprimée : sinon la ligne serait invisible pour
 * margins.resolveBaseFromRows, qui ne connaît que les saisons vivantes.
 */
const upsertPricingRows = async (voyageSlug, { year, season_id: seasonId = null, rows }, editorEmail) => {
  const targetYear = requiredNumber(year, 'year', { min: 2000, max: 2101 })
  if (!Number.isInteger(targetYear)) throw badRequest('year doit être un entier')
  if (!Array.isArray(rows)) throw badRequest('rows doit être un tableau')

  if (seasonId) {
    const { data: season, error } = await supabase
      .from('voyage_margin_seasons')
      .select('id')
      .eq('id', seasonId)
      .eq('voyage_slug', voyageSlug)
      .eq('deleted', false)
      .maybeSingle()
    if (error) throw error
    if (!season) throw badRequest('Saison inconnue pour ce voyage')
  }

  const now = new Date().toISOString()
  const seen = new Set()
  const payload = rows.map((r) => {
    const pax = Number(r.pax)
    if (!Number.isInteger(pax) || pax <= 0) throw badRequest(`pax invalide : ${r.pax}`)
    if (seen.has(pax)) throw badRequest(`palier ${pax} présent deux fois`)
    seen.add(pax)
    const margin = requiredNumber(r.margin_per_traveler, `margin_per_traveler (palier ${pax})`)
    return {
      voyage_slug: voyageSlug,
      pax,
      year: targetYear,
      season_id: seasonId || null,
      purchase_cost_per_traveler: requiredNumber(r.purchase_cost_per_traveler, `purchase_cost_per_traveler (palier ${pax})`, { min: 0 }),
      sale_price_per_traveler: requiredNumber(r.sale_price_per_traveler, `sale_price_per_traveler (palier ${pax})`, { min: 0, strictMin: true }),
      fx_rate: optionalNumber(r.fx_rate, `fx_rate (palier ${pax})`, { min: 0, strictMin: true }) ?? null,
      // Les marges sont entières partout (20260606140000_round_margins.sql).
      margin_per_traveler: Math.round(margin),
      updated_at: now,
      updated_by: editorEmail || null,
      // Seul cet endpoint l'écrit : une ligne dont updated_at le dépasse ensuite
      // a été retouchée par l'ancien éditeur (réconciliation d'Ulysse).
      pricing_updated_at: now,
      // Comme dans margins.upsertMarginForVoyage : sans ça, un ON CONFLICT DO
      // UPDATE écrirait dans une ligne supprimée sans lever la pierre tombale.
      ...softDelete.clear(),
    }
  })

  if (!payload.length) return []

  const { data, error } = await supabase
    .from('voyage_margins')
    .upsert(payload, { onConflict: 'voyage_slug,pax,year,season_id' })
    .select(ROW_COLUMNS)

  if (error) throw error
  return data
}

/**
 * Bascule d'un voyage : sa marge devient dérivée du coût (`purchase_cost`), ou
 * redevient saisie (`entered`).
 *
 * Refusée tant qu'une ligne vivante porte une marge sans coût d'achat : elle
 * resterait une marge saisie au milieu de marges dérivées, sans que rien ne le
 * montre. La réconciliation (marge dérivée = marge stockée), elle, est faite
 * par Ulysse avant l'appel.
 */
const setMarginBasis = async (voyageSlug, basis, editorEmail) => {
  if (!BASES.includes(basis)) throw badRequest(`margin_basis doit être ${BASES.join(', ')}`)

  if (basis === 'purchase_cost') {
    const [{ data: settings, error: settingsError }, { data: missing, error: rowsError }] = await Promise.all([
      supabase.from('voyage_margin_settings').select('grid_model').eq('voyage_slug', voyageSlug).maybeSingle(),
      supabase
        .from('voyage_margins')
        .select('pax, year')
        .eq('voyage_slug', voyageSlug)
        .eq('deleted', false)
        .not('margin_per_traveler', 'is', null)
        .is('purchase_cost_per_traveler', null),
    ])
    if (settingsError) throw settingsError
    if (rowsError) throw rowsError
    if (!settings?.grid_model) {
      const err = new Error('Aucun modèle tarifaire pour ce voyage : rien ne dérive sa marge.')
      err.statusCode = 409
      throw err
    }
    if (missing?.length) {
      const err = new Error(`${missing.length} palier(s) ont une marge sans coût d'achat : la bascule les laisserait en marge saisie.`)
      err.statusCode = 409
      throw err
    }
  }

  const { data, error } = await supabase
    .from('voyage_margin_settings')
    .update({ margin_basis: basis, pricing_updated_at: new Date().toISOString(), pricing_updated_by: editorEmail || null })
    .eq('voyage_slug', voyageSlug)
    .select(SETTINGS_COLUMNS)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    const err = new Error('Aucun réglage tarifaire pour ce voyage.')
    err.statusCode = 404
    throw err
  }
  return data
}

export default {
  GRID_MODELS,
  CURRENCIES,
  BASES,
  upsertPricingSettings,
  upsertPricingRows,
  setMarginBasis,
}
