import supabase from './supabase'

// Soft delete standard. Voir supabase/migrations/20260801090000_soft_delete.sql.
//
// Toute suppression du projet passe par ici : la contrainte
// `<table>_tombstone_chk` en base refuse un `deleted = true` sans deleted_at ni
// deleted_reason, donc un `.update({ deleted: true })` écrit à la main échoue.
//
// Export par défaut objet (comme booking., departures., margins.) : les noms
// `remove` / `restore` sont trop génériques pour l'auto-import de nitro
// (nuxt.config.ts -> nitro.imports.dirs: ['server/utils/**']).

export const DELETE_REASONS = {
  // Action opérateur depuis le BMS.
  MANUAL: 'manual',
  // Enfant supprimé PARCE QUE sa date parente l'a été. C'est cette valeur qui
  // rend la restauration correcte : restaurer une date ne restaure que ses
  // enfants en cascade, jamais ceux supprimés un par un avant.
  CASCADE_TRAVEL_DATE: 'cascade_travel_date',
  // Palier de marge supprimé PARCE QUE la saison qui le porte a été retirée de
  // la liste de l'éditeur. Distinct de CASCADE_TRAVEL_DATE à dessein : les deux
  // restaurations ne passent pas par le même chemin (re-création de la saison
  // d'un côté, restore.post.js de l'autre), et les confondre ferait remonter des
  // montants de saison en restaurant une date.
  CASCADE_MARGIN_SEASON: 'cascade_margin_season',
  AC_DEAL_DELETED: 'ac_deal_deleted',
  AC_DEAL_TRASHED: 'ac_deal_trashed',
  AC_DEAL_LOST: 'ac_deal_lost',
  AC_CONTACT_DELETED: 'ac_contact_deleted',
  PURGE: 'purge',
}

// Le payload « pierre tombale ». Exporté pour les appelants qui doivent l'écrire
// à l'intérieur d'un .update() plus large (cascade, résurrection) plutôt que de
// faire une seconde écriture.
const stamp = (user, reason, batch = null) => ({
  deleted: true,
  deleted_at: new Date().toISOString(),
  deleted_by: user?.email || 'system',
  deleted_reason: reason,
  deleted_batch: batch,
})

const clear = () => ({
  deleted: false,
  deleted_at: null,
  deleted_by: null,
  deleted_reason: null,
  deleted_batch: null,
})

const newBatch = () => globalThis.crypto.randomUUID()

/**
 * Supprime (soft) les lignes correspondant au filtre.
 *
 * @param {string} table
 * @param {(query) => query} applyFilters  ex. q => q.eq('travel_date_id', id)
 * @param {object}   opts
 * @param {object}   [opts.user]    { email } pour la piste d'audit
 * @param {string}   [opts.reason]  DELETE_REASONS.*
 * @param {string}   [opts.batch]   id de lot, pour regrouper une cascade
 * @param {string}   [opts.select]  colonnes renvoyées
 * @returns {Promise<{ rows: object[], count: number, error: string|null }>}
 *
 * Le garde `.eq('deleted', false)` rend l'opération idempotente : rejouer une
 * cascade n'écrase jamais la raison d'un tombstone existant. C'est exactement
 * cette propriété qui rend la restauration par raison correcte — une
 * réservation supprimée manuellement AVANT la suppression de sa date garde
 * `manual` et ne remonte donc pas avec la date.
 */
const remove = async (table, applyFilters, {
  user = null,
  reason = DELETE_REASONS.MANUAL,
  batch = null,
  select = 'id',
} = {}) => {
  const query = supabase
    .from(table)
    .update(stamp(user, reason, batch))
    .eq('deleted', false)

  const { data, error } = await applyFilters(query).select(select)
  if (error) {
    console.error(`[softDelete] ${table} remove failed`, error)
    return { rows: [], count: 0, error: error.message }
  }
  return { rows: data || [], count: data?.length || 0, error: null }
}

/**
 * Miroir de remove(). Garde sur `.eq('deleted', true)` : restaurer deux fois
 * est un no-op, et on ne réinitialise jamais l'audit d'une ligne active.
 */
const restore = async (table, applyFilters, { select = 'id' } = {}) => {
  const query = supabase
    .from(table)
    .update(clear())
    .eq('deleted', true)

  const { data, error } = await applyFilters(query).select(select)
  if (error) {
    console.error(`[softDelete] ${table} restore failed`, error)
    return { rows: [], count: 0, error: error.message }
  }
  return { rows: data || [], count: data?.length || 0, error: null }
}

/**
 * Select « lignes actives » ergonomique. Renvoie un filter builder PostgREST
 * normal, donc le chaînage habituel continue.
 *
 * À n'utiliser QUE dans les helpers chauds (booking.js, departures.js,
 * margins.js) : ailleurs, écrire le `.eq('deleted', false)` littéral, sinon
 * `grep "from('booked_dates')"` cesse d'être un inventaire complet — et c'est
 * comme ça que l'audit de cette migration a été construit.
 */
const active = (table, columns = '*') =>
  supabase.from(table).select(columns).eq('deleted', false)

export default {
  remove,
  restore,
  active,
  stamp,
  clear,
  newBatch,
  REASONS: DELETE_REASONS,
}
