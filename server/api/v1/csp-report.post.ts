import supabase from '../../utils/supabase'

// Sink des rapports de violation CSP émis par les navigateurs.
//
// Cet endpoint est public et non authentifié — il le doit : c'est le navigateur
// du visiteur qui poste, sans cookie ni credential. Il est donc spammable par
// n'importe qui, d'où les garde-fous ci-dessous (taille, forme, filtrage du
// bruit, déduplication). Comme le sink funnel-error, il ne doit JAMAIS throw :
// un rapport perdu est sans conséquence, une 500 en boucle sur chaque page vue
// n'en est pas une.

// Deux formats coexistent selon le mécanisme déclaré dans le header :
//   - report-uri (historique)  -> application/csp-report, { "csp-report": {...} }
//     clés en kebab-case : 'effective-directive', 'blocked-uri', 'document-uri'
//   - report-to (Reporting API) -> application/reports+json, [ { type, body } ]
//     clés en camelCase : effectiveDirective, blockedURL, documentURL
// On déclare les deux (voir server/middleware/csp-report-only.ts), donc on doit
// savoir lire les deux.
interface RawReport {
  'effective-directive'?: string
  'violated-directive'?: string
  'blocked-uri'?: string
  'document-uri'?: string
  'disposition'?: string
  'effectiveDirective'?: string
  'blockedURL'?: string
  'documentURL'?: string
}

// Les extensions de navigateur déclenchent des violations en permanence en
// injectant leurs propres scripts dans la page. Ce n'est pas notre code et on
// n'y peut rien : sans ce filtre, elles représentent l'essentiel du volume et
// noient les vraies violations. Même logique pour 'about:'/'null' que certains
// navigateurs renvoient quand ils masquent l'URL bloquée cross-origin.
const NOISE_PREFIXES = [
  'chrome-extension:',
  'moz-extension:',
  'safari-extension:',
  'safari-web-extension:',
  'webkit-masked-url:',
  'about:',
]

// Valeurs non-URL que la spec autorise pour blocked-uri. On les garde (savoir
// qu'on viole 'inline' est utile) mais elles ne passent pas par new URL().
const KEYWORD_URIS = ['inline', 'eval', 'data', 'blob', 'wasm-eval', 'self']

const MAX_FIELD_LENGTH = 500

// Déduplication en mémoire. Une page vue génère ~10 violations, chacune postée
// par le navigateur : sans ça on écrirait des milliers de fois par jour la même
// ligne. Le cache est par instance serverless et meurt avec elle — c'est
// volontairement approximatif, d'où le nom `report_count` documenté comme une
// borne inférieure côté migration.
const recentlyWritten = new Map<string, number>()
const DEDUP_WINDOW_MS = 5 * 60 * 1000

const shouldWrite = (key: string): boolean => {
  const now = Date.now()

  // Purge opportuniste — pas de timer, on nettoie quand on passe.
  if (recentlyWritten.size > 500) {
    for (const [k, seenAt] of recentlyWritten) {
      if (now - seenAt > DEDUP_WINDOW_MS) recentlyWritten.delete(k)
    }
  }

  const seenAt = recentlyWritten.get(key)
  if (seenAt && now - seenAt < DEDUP_WINDOW_MS) return false

  recentlyWritten.set(key, now)
  return true
}

const truncate = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null
  return value.slice(0, MAX_FIELD_LENGTH)
}

// On agrège sur l'origine, pas sur l'URL complète : les URLs de pixels Google
// portent une trentaine de paramètres uniques par appel, donc agréger dessus
// reviendrait à ne pas agréger du tout.
const toOrigin = (blockedUri: string): string | null => {
  if (KEYWORD_URIS.includes(blockedUri)) return blockedUri
  try {
    return new URL(blockedUri).origin
  }
  catch {
    return null
  }
}

// Les previews Vercel servent le même middleware CSP, donc leurs rapports sont
// tout aussi valables — d'où le suffixe .vercel.app en plus des domaines de prod.
const isOurDocument = (documentUri: unknown): boolean => {
  if (typeof documentUri !== 'string' || !documentUri) return false
  try {
    const { hostname } = new URL(documentUri)
    return hostname === 'odysway.com'
      || hostname.endsWith('.odysway.com')
      || hostname.endsWith('.vercel.app')
      || hostname === 'localhost'
  }
  catch {
    return false
  }
}

// Extrait les deux formats vers une forme unique. Retourne null si le rapport
// est inexploitable ou relève du bruit à ignorer.
const normalize = (raw: RawReport) => {
  const directive = raw['effective-directive']
    || raw.effectiveDirective
    || raw['violated-directive']

  const blockedUri = raw['blocked-uri'] || raw.blockedURL
  const documentUri = raw['document-uri'] || raw.documentURL

  if (typeof directive !== 'string' || !directive) return null
  if (typeof blockedUri !== 'string' || !blockedUri) return null
  if (NOISE_PREFIXES.some(prefix => blockedUri.startsWith(prefix))) return null

  // L'endpoint est public : sans ce filtre, n'importe qui peut remplir la table
  // en postant des rapports fabriqués. Un rapport légitime décrit forcément une
  // violation survenue sur une de nos pages, et document-uri est un champ requis
  // par la spec — on peut donc l'exiger sans perdre de vrais rapports.
  if (!isOurDocument(documentUri)) return null

  const origin = toOrigin(blockedUri)
  if (!origin) return null

  return {
    // La directive peut contenir la valeur complète en plus du nom dans le
    // format historique ('script-src https://…') — on ne garde que le nom.
    directive: directive.split(' ')[0].slice(0, 100),
    origin: origin.slice(0, MAX_FIELD_LENGTH),
    blockedUri: truncate(blockedUri),
    documentUri: truncate(documentUri),
  }
}

export default defineEventHandler(async (event) => {
  // Toujours 204 : la spec ne demande aucun corps de réponse, et on ne veut
  // rien apprendre à un client qui sonderait l'endpoint.
  setResponseStatus(event, 204)

  try {
    const body = await readBody(event)
    if (!body) return null

    // report-to envoie un tableau, report-uri un objet unique.
    const reports = Array.isArray(body)
      ? body.filter(entry => entry?.type === 'csp-violation').map(entry => entry?.body)
      : [body['csp-report']]

    for (const raw of reports.slice(0, 20)) {
      if (!raw || typeof raw !== 'object') continue

      const normalized = normalize(raw as RawReport)
      if (!normalized) continue

      const key = `${normalized.directive}|${normalized.origin}`
      if (!shouldWrite(key)) continue

      const { error } = await supabase.rpc('record_csp_violation', {
        p_directive: normalized.directive,
        p_origin: normalized.origin,
        p_blocked_uri: normalized.blockedUri,
        p_document_uri: normalized.documentUri,
        // Renseigné par le navigateur : 'report' en Report-Only, 'enforce'
        // après bascule. Absent des vieux rapports, d'où le défaut.
        p_disposition: truncate((raw as RawReport).disposition) || 'report',
      })

      if (error) {
        // On relâche la clé de dédup : sinon un incident Supabase de 5 minutes
        // ferait silencieusement disparaître la violation de la collecte.
        recentlyWritten.delete(key)
        console.warn('[csp-report] écriture Supabase échouée:', error.message)
      }
    }

    return null
  }
  catch (err) {
    console.warn('[csp-report] rapport ignoré:', (err as Error)?.message || err)
    return null
  }
})
