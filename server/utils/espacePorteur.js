import axios from 'axios'
import { createClient } from '@sanity/client'
import { createError, getCookie, setCookie, deleteCookie } from 'h3'
import portagePage from '#shared/portagePage.js'

// Espace porteur (/espace-porteur) : un porteur (`ulysse.porteurs`) invité
// depuis Ulysse rédige la page de son séjour en portage, sans accès au Studio.
//
// Accès : lien magique signé (server/utils/porteurLien.js) échangé contre un
// cookie httpOnly qui porte le même jeton, renouvelé à chaque visite. Le porteur
// doit être invité (`portage_porteurs`) et non révoqué.
//
// Brouillon dans `portage_pages`. Rien n'est écrit dans Sanity avant la
// soumission, sauf les images (assets, invisibles tant qu'aucun document ne les
// cite). La soumission écrit `drafts.<sanity_id>` ; Odysway relit et publie
// dans le Studio.

const COOKIE = 'odysway_porteur'
const RENOUVELER_SOUS_S = 20 * 24 * 60 * 60
const isDev = process.env.NODE_ENV !== 'production'

const sanityEcriture = () => {
  const config = useRuntimeConfig()
  if (!process.env.SANITY_WRITE_TOKEN) throw createError({ statusCode: 500, statusMessage: 'Écriture Sanity non configurée.' })
  return createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: '2025-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    perspective: 'raw',
  })
}

// --- Session -----------------------------------------------------------------

const poserSession = (event, porteurId) => {
  setCookie(event, COOKIE, porteurLien.signer(porteurId, { cle: porteurLien.secret() }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: porteurLien.DUREE_S,
    secure: !isDev,
  })
}

const fermerSession = event => deleteCookie(event, COOKIE, { path: '/' })

const lirePorteur = async (porteurId) => {
  const { data, error } = await supabase.from('portage_porteurs')
    .select('porteur_id, nom, email, revoque_le')
    .eq('porteur_id', porteurId).maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Lecture impossible pour le moment.' })
  return data && !data.revoque_le ? data : null
}

/** Échange le jeton du lien magique contre la session. `null` si refusé. */
const ouvrirSession = async (event, jeton) => {
  const ok = porteurLien.verifier(jeton, { cle: porteurLien.secret() })
  if (!ok) return null
  const porteur = await lirePorteur(ok.porteurId)
  if (!porteur) return null
  poserSession(event, porteur.porteur_id)
  return porteur
}

const requirePorteur = async (event) => {
  const ok = porteurLien.verifier(getCookie(event, COOKIE), { cle: porteurLien.secret() })
  const porteur = ok ? await lirePorteur(ok.porteurId) : null
  if (!porteur) {
    fermerSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Lien expiré ou accès retiré. Demandez un nouveau lien à Odysway.' })
  }
  if (ok.exp - Date.now() / 1000 < RENOUVELER_SOUS_S) poserSession(event, porteur.porteur_id)
  return porteur
}

// --- Pages -------------------------------------------------------------------

const COLONNES = 'id, porteur_id, statut, payload, revision, sanity_id, slug, soumis_le, publie_le, created_at, updated_at'

const vuePage = row => ({
  id: row.id,
  statut: row.statut,
  payload: portagePage.nettoyer(row.payload),
  revision: row.revision,
  slug: row.slug,
  soumisLe: row.soumis_le,
  publieLe: row.publie_le,
  modifieLe: row.updated_at,
  lienPublic: row.publie_le && row.slug ? `${useRuntimeConfig().public.siteURL}/portage/${row.slug}` : null,
})

// Odysway publie dans le Studio : la page passe « publiée » quand le document
// publié existe et qu'aucun brouillon n'attend. Lu ici plutôt que par webhook.
const synchroniserStatuts = async (rows) => {
  const soumises = rows.filter(r => r.sanity_id && r.statut === 'soumis')
  if (!soumises.length) return rows
  let docs
  try {
    const ids = soumises.flatMap(r => [r.sanity_id, `drafts.${r.sanity_id}`])
    docs = new Set(await sanityEcriture().fetch('*[_id in $ids]._id', { ids }))
  }
  catch (err) {
    console.error('[espace-porteur] statuts Sanity illisibles', err?.message)
    return rows
  }
  const maintenant = new Date().toISOString()
  for (const r of soumises) {
    if (!docs.has(r.sanity_id) || docs.has(`drafts.${r.sanity_id}`)) continue
    const { error } = await supabase.from('portage_pages')
      .update({ statut: 'publie', publie_le: maintenant }).eq('id', r.id).eq('statut', 'soumis')
    if (!error) Object.assign(r, { statut: 'publie', publie_le: maintenant })
  }
  return rows
}

const pagesDuPorteur = async (porteurId) => {
  const { data, error } = await supabase.from('portage_pages').select(COLONNES)
    .eq('porteur_id', porteurId).order('created_at', { ascending: true })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Lecture impossible pour le moment.' })
  return synchroniserStatuts(data || [])
}

const pageDuPorteur = async (porteur, pageId) => {
  if (!/^[0-9a-f-]{36}$/.test(String(pageId || ''))) throw createError({ statusCode: 404, statusMessage: 'Page introuvable.' })
  const { data, error } = await supabase.from('portage_pages').select(COLONNES)
    .eq('id', pageId).eq('porteur_id', porteur.porteur_id).maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Lecture impossible pour le moment.' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Page introuvable.' })
  return (await synchroniserStatuts([data]))[0]
}

const creerPage = async (porteur) => {
  const { data, error } = await supabase.from('portage_pages')
    .insert({ porteur_id: porteur.porteur_id, payload: portagePage.vide() })
    .select(COLONNES).single()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Création impossible pour le moment.' })
  return data
}

/**
 * Sauvegarde automatique. `revision` : celle que le navigateur a lue ; une autre
 * fenêtre a pu enregistrer entre-temps (409, rien n'est écrasé). Après une
 * soumission, toute modification remet la page en brouillon : elle sera
 * resoumise, et refera un brouillon Sanity, même après publication.
 */
const enregistrer = async (porteur, pageId, { payload, revision }) => {
  const page = await pageDuPorteur(porteur, pageId)
  if (Number(revision) !== page.revision) {
    throw createError({ statusCode: 409, statusMessage: 'Cette page a été modifiée dans une autre fenêtre. Rechargez pour reprendre la dernière version.' })
  }
  const propre = portagePage.nettoyer(payload)
  const { data, error } = await supabase.from('portage_pages')
    .update({ payload: propre, revision: page.revision + 1, statut: 'brouillon', updated_at: new Date().toISOString() })
    .eq('id', page.id).eq('revision', page.revision)
    .select(COLONNES).maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Enregistrement impossible pour le moment.' })
  if (!data) throw createError({ statusCode: 409, statusMessage: 'Cette page a été modifiée dans une autre fenêtre. Rechargez pour reprendre la dernière version.' })
  return data
}

// --- Images ------------------------------------------------------------------

const TYPES_IMAGE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const IMAGE_MAX = 4 * 1024 * 1024

// Type lu sur les octets : l'en-tête du navigateur ne prouve rien.
const typeImage = (octets) => {
  if (octets[0] === 0xFF && octets[1] === 0xD8 && octets[2] === 0xFF) return 'image/jpeg'
  if (octets[0] === 0x89 && octets[1] === 0x50 && octets[2] === 0x4E && octets[3] === 0x47) return 'image/png'
  if (octets.subarray(0, 4).toString('latin1') === 'RIFF' && octets.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  return null
}

const deposerImage = async (porteur, fichier) => {
  if (!fichier?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Aucune image reçue.' })
  if (fichier.data.length > IMAGE_MAX) throw createError({ statusCode: 413, statusMessage: 'Image trop lourde (4 Mo maximum).' })
  const type = typeImage(fichier.data)
  if (!type) throw createError({ statusCode: 415, statusMessage: 'Format non pris en charge : JPEG, PNG ou WebP.' })
  try {
    const asset = await sanityEcriture().assets.upload('image', fichier.data, {
      filename: `portage-${porteur.porteur_id.slice(0, 8)}-${Date.now()}.${TYPES_IMAGE[type]}`,
      contentType: type,
      source: { name: 'espace-porteur', id: porteur.porteur_id },
    })
    return { ref: asset._id, url: asset.url, largeur: asset.metadata?.dimensions?.width, hauteur: asset.metadata?.dimensions?.height }
  }
  catch (err) {
    console.error('[espace-porteur] image non envoyée à Sanity', err?.message)
    throw createError({ statusCode: 502, statusMessage: 'L\'image n\'a pas pu être enregistrée. Réessayez dans un instant.' })
  }
}

// --- Soumission --------------------------------------------------------------

// Un slug libre, sans prendre celui d'un autre voyage : `-2`, `-3`…
const slugLibre = async (client, voulu, sanityId) => {
  const base = voulu || 'sejour-portage'
  for (let i = 1; i < 50; i++) {
    const slug = i === 1 ? base : `${base}-${i}`
    const pris = await client.fetch(
      'count(*[_type == "voyage" && slug.current == $slug && !(_id in [$id, $brouillon])])',
      { slug, id: sanityId, brouillon: `drafts.${sanityId}` },
    )
    if (!pris) return slug
  }
  throw createError({ statusCode: 409, statusMessage: 'Choisissez un autre titre : celui-ci est déjà pris.' })
}

const lienStudio = sanityId =>
  `${(process.env.SANITY_STUDIO_URL || 'https://odysway.sanity.studio').replace(/\/$/, '')}/intent/edit/id=${sanityId};type=voyage/`

const soumettre = async (porteur, pageId) => {
  const page = await pageDuPorteur(porteur, pageId)
  const manque = portagePage.manques(page.payload)
  if (manque.length) throw createError({ statusCode: 422, statusMessage: `Il manque encore ${manque.join(', ')}.`, data: { manques: manque } })
  if (page.statut === 'soumis') return page

  // Id tiré de la page : une soumission rejouée après un échec retombe sur le
  // même document au lieu d'en créer un second.
  const sanityId = page.sanity_id || `voyage-portage-${page.id}`
  const client = sanityEcriture()
  const [brouillon, publie] = await Promise.all([client.getDocument(`drafts.${sanityId}`), client.getDocument(sanityId)])
  const base = brouillon || publie || null
  const slug = base?.slug?.current || await slugLibre(client, portagePage.slugifier(page.payload.titre), sanityId)
  const doc = portagePage.versDocumentSanity(page.payload, { sanityId, slug, base })

  try {
    await client.createOrReplace(doc)
  }
  catch (err) {
    console.error('[espace-porteur] brouillon Sanity non écrit', page.id, err?.message)
    throw createError({ statusCode: 502, statusMessage: 'La soumission n\'a pas pu aboutir. Réessayez dans un instant.' })
  }

  const maintenant = new Date().toISOString()
  const { data, error } = await supabase.from('portage_pages')
    .update({ statut: 'soumis', sanity_id: sanityId, slug: doc.slug.current, soumis_le: maintenant, updated_at: maintenant })
    .eq('id', page.id).select(COLONNES).single()
  if (error) {
    console.error('[espace-porteur] statut non écrit après soumission', page.id, error.message)
    throw createError({ statusCode: 500, statusMessage: 'Soumission reçue, mais son suivi n\'a pas pu être enregistré. Réessayez.' })
  }

  await slack.alertPortagePage({
    porteur: porteur.nom,
    email: porteur.email,
    titre: doc.title,
    miseAJour: Boolean(publie),
    lienStudio: lienStudio(sanityId),
  })
  return data
}

// --- Invitation (depuis Ulysse) ----------------------------------------------

const echapper = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const emailInvitation = ({ nom, lien }) => ({
  subject: 'Rédigez la page de votre séjour avec Odysway',
  html: `<!doctype html><html lang="fr"><body style="margin:0;background:#F1F4F4;font-family:Arial,sans-serif;color:#2B4C52">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;padding:32px">
<tr><td style="font-size:22px;font-weight:700;padding-bottom:20px">odysway<span style="color:#DB6644">.</span></td></tr>
<tr><td style="font-size:15px;line-height:1.6">
<p>Bonjour${nom ? ` ${echapper(nom)}` : ''},</p>
<p>Votre Espace porteur est prêt : vous pouvez y rédiger la page de votre séjour (programme, hébergement, photos, questions fréquentes) et la voir telle qu'elle apparaîtra sur odysway.com.</p>
<p>Vos modifications sont enregistrées au fil de l'eau. Quand la page vous convient, soumettez-la : notre équipe la relit, puis la met en ligne.</p>
<p style="margin:28px 0"><a href="${echapper(lien)}" style="background:#DB6644;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">Ouvrir mon Espace porteur</a></p>
<p style="font-size:13px;color:#5F7A80">Ce lien vous est personnel et reste valable 30 jours. Ne le transférez pas.</p>
</td></tr></table>
<p style="font-size:12px;color:#8A9BA0;margin-top:16px">Odysway · +33 1 84 80 79 75</p>
</td></tr></table></body></html>`,
})

const envoyerEmail = async ({ to, subject, html }) => {
  await axios.post('https://api.brevo.com/v3/smtp/email', {
    sender: { name: 'Odysway', email: 'contact@odysway.com' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  }, { headers: { 'api-key': process.env.BREVO_API_KEY, 'Accept': 'application/json', 'Content-Type': 'application/json' } })
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Invite (ou réinvite) un porteur. Le nom et l'email viennent d'Ulysse : sa fiche
 * fait foi. Lève l'accès révoqué. `envoyer: false` rend le lien sans email
 * (Ulysse peut le copier).
 */
const inviter = async ({ porteurId, nom, email, envoyer = true, par }) => {
  const id = String(porteurId || '').toLowerCase()
  const adresse = String(email || '').trim().toLowerCase()
  if (!/^[0-9a-f-]{36}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant de porteur invalide.' })
  if (!EMAIL.test(adresse)) throw createError({ statusCode: 400, statusMessage: 'Ce porteur n\'a pas d\'email valide.' })
  const nomPropre = String(nom || '').trim().slice(0, 160)
  if (!nomPropre) throw createError({ statusCode: 400, statusMessage: 'Nom du porteur manquant.' })

  const maintenant = new Date().toISOString()
  const { error } = await supabase.from('portage_porteurs').upsert({
    porteur_id: id, nom: nomPropre, email: adresse, invite_le: maintenant, invite_par: par || null, revoque_le: null, updated_at: maintenant,
  }, { onConflict: 'porteur_id' })
  if (error) throw createError({ statusCode: 500, statusMessage: `Invitation non enregistrée : ${error.message}` })

  const lien = `${useRuntimeConfig().public.siteURL}/espace-porteur?t=${porteurLien.signer(id, { cle: porteurLien.secret() })}`
  if (!envoyer) return { lien, envoye: false }
  try {
    await envoyerEmail({ to: adresse, ...emailInvitation({ nom: nomPropre, lien }) })
  }
  catch (err) {
    console.error('[espace-porteur] invitation non envoyée', id, err?.response?.data || err?.message)
    throw createError({ statusCode: 502, statusMessage: 'L\'email d\'invitation n\'a pas pu partir. Copiez le lien ou réessayez.', data: { lien } })
  }
  return { lien, envoye: true }
}

const revoquer = async (porteurId) => {
  const { data, error } = await supabase.from('portage_porteurs')
    .update({ revoque_le: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('porteur_id', String(porteurId || '').toLowerCase()).select('porteur_id')
  if (error) throw createError({ statusCode: 500, statusMessage: 'Révocation impossible pour le moment.' })
  return { revoque: Boolean(data?.length) }
}

/** Pour la fiche porteur d'Ulysse : l'invitation et l'état de chaque page. */
const etatPorteur = async (porteurId) => {
  const id = String(porteurId || '').toLowerCase()
  const { data: porteur } = await supabase.from('portage_porteurs')
    .select('porteur_id, email, invite_le, invite_par, revoque_le').eq('porteur_id', id).maybeSingle()
  if (!porteur) return { invitation: null, pages: [] }
  const pages = await pagesDuPorteur(id)
  return {
    invitation: { email: porteur.email, inviteLe: porteur.invite_le, invitePar: porteur.invite_par, revoqueLe: porteur.revoque_le },
    pages: pages.map(r => ({
      id: r.id,
      titre: portagePage.nettoyer(r.payload).titre || null,
      statut: r.statut,
      slug: r.slug,
      soumisLe: r.soumis_le,
      publieLe: r.publie_le,
      modifieLe: r.updated_at,
      lienStudio: r.sanity_id ? lienStudio(r.sanity_id) : null,
    })),
  }
}

export default {
  ouvrirSession,
  fermerSession,
  requirePorteur,
  vuePage,
  pagesDuPorteur,
  pageDuPorteur,
  creerPage,
  enregistrer,
  deposerImage,
  soumettre,
  inviter,
  revoquer,
  etatPorteur,
}
