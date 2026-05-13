// One-shot backfill from a local AC export (JSON).
// The AC API doesn't allow `include=dealCustomFieldData` / `include=fieldValues`
// for paginated listing, so we feed from a manual export instead.
//
// Usage:
//   POST /api/v1/ac/backfill?token=<ACTIVECAMPAIGN_WEBHOOK_TOKEN>
//     &file=./export_ac.json       (default: ./export_ac.json at repo root)
//     &batchSize=200               (max 500)
//     &offset=0                    (skip first N rows; for resume)
//     &limit=0                     (process at most N rows; 0 = all)
//     &dryRun=true                 (parse only, no upsert)
//     &withContacts=true           (also upsert minimal contacts from deals)
//
// Only runs locally — the export file is not committed (see .gitignore).

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const TEST_EMAILS = new Set(['ottmann.alex@gmail.com', 'test@gmail.com'])

// "1 578,00€" / "12.000,00€" / "0,00€" → 1578 / 12000 / 0
const parseEuroAmount = (s) => {
  if (s === undefined || s === null || s === '') return null
  let str = String(s).replace(/[\u00A0\u202F\s]/g, '').replace('€', '').replace(/EUR/i, '').trim()
  if (!str) return null
  // European format: "." is thousands separator, "," is decimal.
  if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.')
  const n = +str
  return Number.isNaN(n) ? null : n
}

// "21/10/2023" or "21/10/2023 11:30" → ISO ("2023-10-21T...") — FR custom date fields
const parseDateFR = (s) => {
  if (!s) return null
  const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/)
  if (!m) return null
  const [, dd, mm, yyyy, hh, mn] = m
  const iso = `${yyyy}-${mm}-${dd}${hh ? `T${hh}:${mn}:00` : 'T00:00:00'}Z`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// "12/19/2023 11:49" → ISO — AC system dates (Créées, Mis à jour, ...) use US locale
const parseDateUS = (s) => {
  if (!s) return null
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/)
  if (!m) return null
  const [, mm, dd, yyyy, hh, mn] = m
  const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}${hh ? `T${hh}:${mn}:00` : 'T00:00:00'}Z`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const toBool = (v) => {
  if (v === undefined || v === null || v === '') return null
  return v === 'Oui' || v === true || v === 'true' || v === '1'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.token || query.token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }

  const filePath = query.file ? String(query.file) : resolve(process.cwd(), 'export_ac.json')
  const batchSize = Math.min(+query.batchSize || 200, 500)
  const startOffset = +query.offset || 0
  const limit = +query.limit || 0
  const dryRun = query.dryRun === 'true' || query.dryRun === '1'
  const withContacts = query.withContacts === 'true' || query.withContacts === '1'

  const stats = {
    startedAt: new Date().toISOString(),
    file: filePath,
    totalDeals: 0,
    dealsProcessed: 0,
    dealsSkipped: 0,
    contactsProcessed: 0,
    errors: [],
    dryRun,
  }

  console.log('[backfill-file] reading', filePath)
  let raw
  try {
    raw = await readFile(filePath, 'utf8')
  }
  catch (err) {
    return { error: `Cannot read file: ${err.message}` }
  }

  let deals
  try {
    deals = JSON.parse(raw)
  }
  catch (err) {
    return { error: `Invalid JSON: ${err.message}` }
  }
  if (!Array.isArray(deals)) {
    return { error: 'Expected JSON to be an array of deal objects' }
  }
  stats.totalDeals = deals.length
  console.log('[backfill-file] parsed', deals.length, 'deals')

  // Optional slice
  const sliced = limit > 0 ? deals.slice(startOffset, startOffset + limit) : deals.slice(startOffset)

  // Build deal rows + (optional) deduped contact rows
  const dealRows = []
  const contactsById = new Map()
  for (const d of sliced) {
    const pipelineId = +d['Pipeline ID']
    if (pipelineId === 4) {
      stats.dealsSkipped++
      continue
    }
    const email = d['E-mail du contact primaire']
    if (TEST_EMAILS.has(email)) {
      stats.dealsSkipped++
      continue
    }
    const dealId = d['ID Offres']
    const contactId = d['ID du contact principal']
    if (!dealId || !contactId) {
      stats.dealsSkipped++
      continue
    }
    dealRows.push(buildDealRow(d))
    if (withContacts && !contactsById.has(contactId)) {
      contactsById.set(contactId, buildContactRow(d))
    }
  }
  console.log('====LOG ONE====', dealRows.find(deal => deal.id == '14772'))

  console.log(`[backfill-file] ready deals=${dealRows.length} contacts=${contactsById.size} (skipped=${stats.dealsSkipped})`)

  // Upsert contacts first (so deal FK is satisfied, if any)
  if (withContacts && contactsById.size > 0) {
    const contactRows = [...contactsById.values()]
    for (let i = 0; i < contactRows.length; i += batchSize) {
      const batch = contactRows.slice(i, i + batchSize)
      if (!dryRun) {
        const { error } = await supabase
          .from('activecampaign_clients')
          .upsert(batch, { onConflict: 'contact' })
        if (error) {
          console.error('[backfill-file][contacts] batch error at', i, error)
          stats.errors.push({ phase: 'contacts', batchStart: i, message: error.message })
        }
        else {
          stats.contactsProcessed += batch.length
        }
      }
      else {
        stats.contactsProcessed += batch.length
      }
    }
    console.log('[backfill-file] contacts done', stats.contactsProcessed)
  }

  // Upsert deals
  for (let i = 0; i < dealRows.length; i += batchSize) {
    const batch = dealRows.slice(i, i + batchSize)
    if (!dryRun) {
      // onConflict: 'id' — the legacy UNIQUE(id) constraint coexists with the
      // composite PK (id, contact). When a deal's primary contact changes in AC,
      // matching on id alone lets us overwrite contact + all other columns.
      const { error } = await supabase
        .from('activecampaign_deals')
        .upsert(batch, { onConflict: 'id' })
      if (error) {
        console.error('[backfill-file][deals] batch error at', i, error)
        stats.errors.push({ phase: 'deals', batchStart: i, message: error.message })
      }
      else {
        stats.dealsProcessed += batch.length
      }
    }
    else {
      stats.dealsProcessed += batch.length
    }
    if ((i / batchSize) % 5 === 0) {
      console.log(`[backfill-file][deals] progress ${stats.dealsProcessed}/${dealRows.length}`)
    }
  }

  stats.finishedAt = new Date().toISOString()
  console.log('[backfill-file] done', stats)
  return stats
})

function buildDealRow(d) {
  return {
    id: d['ID Offres'],
    contact: d['ID du contact principal'],
    title: d.Titre || null,
    status: d.Statut || null,
    stage: d.Etape || null,
    stage_id: d['ID Etape'] ? String(d['ID Etape']) : null,
    pipeline_id: +d['Pipeline ID'] || null,
    pipeline_title: d.Pipeline || null,
    owner_id: d['ID Gestionnaire'] ? String(d['ID Gestionnaire']) : null,
    seller: d['Nom du propriétaire'] || null,
    currency: d.Devise || null,
    win_probability: null,
    next_date: parseDateUS(d['Prochaine date d\'action']),
    next_task_id: null,
    total_value: parseEuroAmount(d.Valeur) ?? 0,
    price_per_traveler: parseEuroAmount(d['Prix par voyageur (base)*']) ?? 0,
    nb_traveler: +d['Nombre de voyageurs*'] || 0,
    nb_adults: +d['Nombre de voyageurs adultes'] || 0,
    nb_children: +d['Nombre de voyageurs enfants'] || 0,
    nb_under_age: +d['Nombre enfants (-12ans)'] || 0,
    nb_teen: +d['Nombre adolescent (-18ans)'] || 0,
    travel_type: d['Type de voyages*'] || null,
    indiv_room: toBool(d['Chambre Individuelle (Oui/Non)']),
    indiv_room_price: parseEuroAmount(d['Prix Chambre individuelle']) ?? 0,
    deposit_price: parseEuroAmount(d['Prix acompte par voyageur (base)*']) ?? 0,
    extension_price: parseEuroAmount(d['Extension par voyageur']) ?? 0,
    agent_cost: parseEuroAmount(d['Coût d\'achat Agent']) ?? 0,
    rest_to_pay: parseEuroAmount(d['Solde Restant Total']) ?? 0,
    total_paid: parseEuroAmount(d['Total payé']) ?? 0,
    margin_per_traveler: parseEuroAmount(d['Marge par voyageur (base)']) ?? 0,
    flight_margin: parseEuroAmount(d['Marge vol par voyageur']) ?? 0,
    total_margin: parseEuroAmount(d['Marge totale dossier']) ?? 0,
    insurance_commission: parseEuroAmount(d['Prix Assurance par pax']) ?? 0,
    insurance_choice: d['Assurances prise (Choix)'] || 'Aucune Assurance',
    insurance_price_per_traveler: parseEuroAmount(d['Commission assurance par pax (30%)']) ?? 0,
    is_cap_exploraction: toBool(d['CAP-EXPLORACTION']),
    promo_code: d['Code promo'] || null,
    applied_promo_per_traveler: parseEuroAmount(d['Réduction Appliquée € par pax']) ?? 0,
    children_promo: parseEuroAmount(d['Réduction enfant -12 ans']) ?? 80,
    promo_earlybird: parseEuroAmount(d['Réduction EarlyBird']) ?? 0,
    got_earlybird: toBool(d['EarlyBird Disponible ? ']),
    promo_last_minute: parseEuroAmount(d['Réduction LastMinute']) ?? 0,
    got_last_minute: toBool(d['LastMinute Disponible ?']),
    country: d.Pays || 'Non renseigné',
    iso: d['ISO*'] || null,
    zone_chapka: +d['Zone Chapka*'] || null,
    is_couple: toBool(d['En Couple (Oui/Non)']),
    lost_reason: d['Raison Perte'] || d['Autre Raison Perte'] || null,
    rest_to_pay_per_traveler: null, // not present in the export
    max_children_age: +d['Âge Maximum tarif enfant'] || 12,
    include_flight: toBool(d['Vol Inclus (Oui/Non)']),
    flight_ticket_bought: toBool(d['Billets d\'avion acheté (Oui/Non)']),
    flight_ticket_price_per_traveler: parseEuroAmount(d['Prix Billets d\'avion par voyageur']) ?? 0,
    departure_date: parseDateFR(d['Date de départ*']),
    return_date: parseDateFR(d['Date de retour*']),
    forecasted_closing_date: parseDateFR(d['Date de fermeture prévue']),
    conversion_date: parseDateFR(d['Date de conversion']),
    source: d.source || null,
    acquisition_source: d['Source d\'acquisition'] || null,
    other_acquisition_source: d['Autre source acquisition'] || null,
    utm: d.UTM || null,
    slug: d.Slug || null,
    current_step: d['Etape Actuelle'] || null,
    link_bms: d['Lien vers BMS'] || null,
    paiement_method: d['Moyens de paiement utilisés'] || null,
    created_at: parseDateFR(d['Date de création (DealBackOffice)']) || parseDateUS(d['Créées']),
    mdate: parseDateUS(d['Mis à jour']),
    updated_at: parseDateUS(d['Mis à jour']),
  }
}

function buildContactRow(d) {
  // Minimal contact derived from the deal export — phone/birthdate/address/tags
  // are not available in the deals export and will be filled by the contact
  // webhook on next AC update.
  return {
    id: d['ID du contact principal'],
    contact: d['ID du contact principal'],
    email: d['E-mail du contact primaire'],
    firstname: d['Prénom du contact principal'] || null,
    lastname: d['Nom de famille du contact principal'] || null,
    created_at: parseDateUS(d['Créées']) || new Date().toISOString(),
  }
}
