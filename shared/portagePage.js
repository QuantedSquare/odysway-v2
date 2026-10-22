// Page d'un séjour en portage rédigée par son porteur dans l'Espace porteur
// (/espace-porteur), sans accès au Studio.
//
// Le brouillon (`portage_pages.payload`) est un objet simple, pensé pour le
// formulaire ; ce module le nettoie, et le traduit dans la forme du document
// Sanity `voyage` (cms/schemaTypes/voyageType.ts) :
//   - `versDocumentSanity` : le brouillon `drafts.<id>` écrit à la soumission ;
//   - `versVoyageApercu` : l'objet que la page /portage/<slug> lit dans Sanity,
//     pour l'aperçu en direct avec les mêmes composants.
//
// PUR et partagé (serveur + navigateur, tests/unit/portagePage.test.mjs).

const LIMITES = {
  titre: 120,
  accroche: 400,
  texteCourt: 160,
  texteLong: 6000,
  galerie: 24,
  videos: 6,
  programme: 30,
  equipe: 6,
  hebergements: 10,
  photosHebergement: 8,
  listeItems: 40,
  faq: 30,
}

const REF_IMAGE = /^image-[a-f0-9]{40}-\d{1,5}x\d{1,5}-[a-z0-9]{2,5}$/
const CLE = /^[A-Za-z0-9]{1,24}$/
const ID_SANITY = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

const texte = (valeur, max) => (typeof valeur === 'string' ? valeur.replace(/\r\n?/g, '\n').trim().slice(0, max) : '')

const nombre = (valeur, { min, max }) => {
  if (valeur === null || valeur === undefined || valeur === '') return null
  const n = Math.round(Number(valeur))
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

const image = (brute, { alt = false } = {}) => {
  const ref = typeof brute?.ref === 'string' ? brute.ref : ''
  if (!REF_IMAGE.test(ref)) return null
  return alt ? { ref, alt: texte(brute.alt, LIMITES.texteCourt) } : { ref }
}

// VideoDialog charge le lien tel quel dans une iframe : seuls YouTube et Vimeo,
// ramenés à leur adresse d'intégration (celle que le Studio contient déjà).
const VIDEOS = [
  [/^https?:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)([\w-]{11})/, id => `https://www.youtube.com/embed/${id}`],
  [/^https?:\/\/youtu\.be\/([\w-]{11})/, id => `https://www.youtube.com/embed/${id}`],
  [/^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/, id => `https://player.vimeo.com/video/${id}`],
  [/^https?:\/\/player\.vimeo\.com\/video\/(\d{6,12})/, id => `https://player.vimeo.com/video/${id}`],
]

/** Lien YouTube ou Vimeo → adresse d'intégration ; `null` si non reconnu. */
const lienVideo = (brut) => {
  const url = texte(brut, 300)
  for (const [motif, integrer] of VIDEOS) {
    const m = motif.exec(url)
    if (m) return integrer(m[1])
  }
  return null
}

const liste = (brute, max) => (Array.isArray(brute) ? brute.slice(0, max) : [])

// Chaque élément de liste garde la clé que le navigateur lui a donnée : elle
// devient son `_key` Sanity, stable d'une soumission à l'autre (le Studio
// compare alors les bons éléments). Une clé absente ou en double est refaite.
const avecCles = (elements, prefixe) => {
  const vues = new Set()
  return elements.map((element, i) => {
    let cle = typeof element?.cle === 'string' && CLE.test(element.cle) ? element.cle : `${prefixe}${i}`
    if (vues.has(cle)) cle = `${prefixe}${i}x${vues.size}`
    vues.add(cle)
    return { ...element, cle }
  })
}

/** Brouillon vierge, la forme que le formulaire édite. */
const vide = () => ({
  titre: '',
  accroche: '',
  dureeJours: null,
  prixIndicatif: null,
  niveau: null,
  image: null,
  imageSecondaire: null,
  galerie: [],
  videos: [],
  accompagnateur: { nom: '', role: '', presentation: '', photo: null },
  equipeIntro: '',
  equipe: [],
  mot: '',
  motSignature: '',
  pointsForts: [],
  programme: [],
  hebergements: [],
  inclus: [],
  nonInclus: [],
  faq: [],
})

/** Ne garde que les champs connus, aux bonnes longueurs. Jamais d'erreur. */
const nettoyer = (brut) => {
  const p = brut && typeof brut === 'object' ? brut : {}
  const acc = p.accompagnateur && typeof p.accompagnateur === 'object' ? p.accompagnateur : {}
  const lignes = (valeur, max) => liste(valeur, max).map(l => texte(l, LIMITES.texteCourt * 2)).filter(Boolean)
  const personne = brute => ({
    nom: texte(brute?.nom, LIMITES.texteCourt),
    role: texte(brute?.role, LIMITES.texteCourt),
    presentation: texte(brute?.presentation, LIMITES.texteLong),
    photo: image(brute?.photo),
  })

  return {
    titre: texte(p.titre, LIMITES.titre),
    accroche: texte(p.accroche, LIMITES.accroche),
    dureeJours: nombre(p.dureeJours, { min: 1, max: 90 }),
    prixIndicatif: nombre(p.prixIndicatif, { min: 1, max: 100000 }),
    niveau: typeof p.niveau === 'string' && ID_SANITY.test(p.niveau) ? p.niveau : null,
    image: image(p.image, { alt: true }),
    imageSecondaire: image(p.imageSecondaire, { alt: true }),
    galerie: avecCles(liste(p.galerie, LIMITES.galerie).map(i => ({ cle: i?.cle, ...image(i, { alt: true }) })), 'g')
      .filter(i => i.ref),
    videos: [...new Set(liste(p.videos, LIMITES.videos).map(lienVideo).filter(Boolean))],
    accompagnateur: personne(acc),
    equipeIntro: texte(p.equipeIntro, LIMITES.texteLong),
    equipe: avecCles(liste(p.equipe, LIMITES.equipe).map(a => ({ cle: a?.cle, ...personne(a) })), 'a'),
    mot: texte(p.mot, LIMITES.texteLong),
    motSignature: texte(p.motSignature, LIMITES.texteCourt),
    pointsForts: lignes(p.pointsForts, LIMITES.listeItems),
    programme: avecCles(liste(p.programme, LIMITES.programme).map(j => ({
      cle: j?.cle,
      etiquette: texte(j?.etiquette, 40),
      titre: texte(j?.titre, LIMITES.texteCourt),
      texte: texte(j?.texte, LIMITES.texteLong),
      denivele: texte(j?.denivele, LIMITES.texteCourt),
      trajet: texte(j?.trajet, LIMITES.texteCourt),
      nuit: texte(j?.nuit, LIMITES.texteCourt),
      photo: image(j?.photo),
    })), 'j'),
    hebergements: avecCles(liste(p.hebergements, LIMITES.hebergements).map(h => ({
      cle: h?.cle,
      titre: texte(h?.titre, LIMITES.texteCourt),
      type: texte(h?.type, LIMITES.texteCourt),
      description: texte(h?.description, LIMITES.texteLong),
      photos: avecCles(liste(h?.photos, LIMITES.photosHebergement).map(i => ({ cle: i?.cle, ...image(i, { alt: true }) })), 'p')
        .filter(i => i.ref),
    })), 'h'),
    inclus: lignes(p.inclus, LIMITES.listeItems),
    nonInclus: lignes(p.nonInclus, LIMITES.listeItems),
    faq: avecCles(liste(p.faq, LIMITES.faq).map(q => ({
      cle: q?.cle,
      question: texte(q?.question, LIMITES.texteCourt * 2),
      reponse: texte(q?.reponse, LIMITES.texteLong),
    })), 'q'),
  }
}

/** Ce qui manque pour soumettre : libellés à montrer au porteur. */
const manques = (payload) => {
  const p = nettoyer(payload)
  const m = []
  if (!p.titre) m.push('le titre du séjour')
  if (!p.image) m.push('l\'image principale')
  if (!p.mot) m.push('votre mot d\'accompagnateur')
  if (!p.programme.some(j => j.titre || j.texte)) m.push('au moins un jour de programme')
  return m
}

// « Mon séjour au Népal ! » → « mon-sejour-au-nepal ». Même règle que le bouton
// « Générer » du Studio, à la translittération près.
const slugifier = titre => String(titre || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 96)
  .replace(/-+$/, '')

// --- Texte libre → Portable Text ----------------------------------------------
//
// Le porteur écrit du texte simple : une ligne = un paragraphe, une ligne qui
// commence par « - », « • » ou « * » = un élément de liste à puces ;
// « **gras** » et « *italique* » deviennent les marques du Studio.

const PUCE = /^\s*[-•*]\s+/
const MARQUES = /\*\*(.+?)\*\*|\*(.+?)\*/g

const segments = (cle, contenu) => {
  const morceaux = []
  let fin = 0
  for (const m of contenu.matchAll(MARQUES)) {
    if (m.index > fin) morceaux.push({ text: contenu.slice(fin, m.index), marks: [] })
    morceaux.push({ text: m[1] ?? m[2], marks: [m[1] === undefined ? 'em' : 'strong'] })
    fin = m.index + m[0].length
  }
  if (fin < contenu.length || !morceaux.length) morceaux.push({ text: contenu.slice(fin), marks: [] })
  return morceaux.map((s, i) => ({ _key: i ? `${cle}s${i}` : `${cle}s`, _type: 'span', marks: s.marks, text: s.text }))
}

const bloc = (cle, contenu, puce) => ({
  _key: cle,
  _type: 'block',
  children: segments(cle, contenu),
  markDefs: [],
  style: 'normal',
  ...(puce ? { level: 1, listItem: 'bullet' } : {}),
})

const texteEnBlocs = (valeur, prefixe) => String(valeur || '')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map((ligne, i) => (PUCE.test(ligne)
    ? bloc(`${prefixe}b${i}`, ligne.replace(PUCE, ''), true)
    : bloc(`${prefixe}b${i}`, ligne, false)))

const listeEnBlocs = (lignes, prefixe) => lignes.map((l, i) => bloc(`${prefixe}b${i}`, l, true))

// --- Images --------------------------------------------------------------------

const imageSanity = (img, { cle, alt = false } = {}) => (img?.ref
  ? {
      ...(cle ? { _key: cle } : {}),
      _type: 'image',
      ...(alt && img.alt ? { alt: img.alt } : {}),
      asset: { _ref: img.ref, _type: 'reference' },
    }
  : undefined)

// --- Champs tenus par le porteur ---------------------------------------------
//
// Tout le reste du document (référence BMS, destinations, badges, SEO, prix
// réels, dates…) appartient à Odysway et n'est jamais touché par une soumission.

// Le porteur est le premier accompagnateur (`_key: 'porteur'`) : son nom, son
// rôle et sa photo signent aussi le mot (PortagePageContent).
const CLE_PORTEUR = 'porteur'

const accompagnant = (a, cle) => (a.nom || a.presentation || a.photo
  ? {
      _key: cle,
      name: a.nom || undefined,
      role: a.role || undefined,
      description: a.presentation ? texteEnBlocs(a.presentation, `${cle}d`) : undefined,
      image: imageSanity(a.photo),
    }
  : null)

const champsPorteur = (payload) => {
  const p = nettoyer(payload)
  const accompagnants = [accompagnant(p.accompagnateur, CLE_PORTEUR), ...p.equipe.map(a => accompagnant(a, a.cle))].filter(Boolean)

  return {
    title: p.titre,
    description: p.accroche || undefined,
    duration: p.dureeJours ?? (p.programme.length || undefined),
    difficultyLevel: p.niveau ? { _type: 'reference', _ref: p.niveau } : undefined,
    image: imageSanity(p.image, { alt: true }),
    imageSecondary: imageSanity(p.imageSecondaire, { alt: true }),
    photosList: p.galerie.length ? p.galerie.map(i => imageSanity(i, { cle: i.cle, alt: true })) : undefined,
    videoLinks: p.videos.length ? p.videos : undefined,
    authorNote: p.mot || p.motSignature
      ? { text: p.mot ? texteEnBlocs(p.mot, 'mot') : undefined, affixeAuthor: p.motSignature || undefined }
      : undefined,
    experiencesBlock: p.pointsForts.length ? listeEnBlocs(p.pointsForts, 'pf') : undefined,
    accompanistsDescription: p.equipeIntro ? texteEnBlocs(p.equipeIntro, 'eq') : undefined,
    accompanistsList: accompagnants.length ? accompagnants : undefined,
    programmeBlock: p.programme.length
      ? p.programme.map((j, i) => ({
          _key: j.cle,
          title: j.titre || undefined,
          badgeText: j.etiquette || `JOUR ${i + 1}`,
          description: j.texte ? texteEnBlocs(j.texte, j.cle) : undefined,
          photo: imageSanity(j.photo),
          denivellation: j.denivele || undefined,
          road: j.trajet || undefined,
          night: j.nuit || undefined,
        }))
      : undefined,
    housingBlock: p.hebergements.length
      ? p.hebergements.map(h => ({
          _key: h.cle,
          title: h.titre || undefined,
          housingType: h.type || undefined,
          housingMood: h.description ? texteEnBlocs(h.description, h.cle) : undefined,
          image: h.photos.length ? h.photos.map(i => imageSanity(i, { cle: i.cle, alt: true })) : undefined,
        }))
      : undefined,
    pricingDetailsBlock: p.inclus.length || p.nonInclus.length
      ? {
          listInclude: p.inclus.length ? listeEnBlocs(p.inclus, 'inc') : undefined,
          listExclude: p.nonInclus.length ? listeEnBlocs(p.nonInclus, 'exc') : undefined,
        }
      : undefined,
    faqBlock: p.faq.length
      ? p.faq.filter(q => q.question).map(q => ({
          _key: q.cle,
          question: q.question,
          answer: q.reponse ? texteEnBlocs(q.reponse, q.cle) : undefined,
        }))
      : undefined,
    startingPrice: p.prixIndicatif ?? undefined,
  }
}

// Sanity refuse les `undefined` explicites dans un document : on les retire,
// récursivement, comme le ferait JSON.stringify.
const sansIndefinis = valeur => JSON.parse(JSON.stringify(valeur))

const SYSTEME = ['_id', '_rev', '_createdAt', '_updatedAt']

/**
 * Le brouillon Sanity `drafts.<sanityId>` d'une soumission.
 *
 * `base` : le brouillon déjà là, sinon le document publié, sinon rien. Ce que
 * le porteur ne tient pas en est repris tel quel — Odysway a pu le remplir dans
 * le Studio. Le slug d'une page déjà en ligne ne change jamais (le lien est
 * partagé), et une page publiée le reste pendant la relecture du brouillon.
 */
const versDocumentSanity = (payload, { sanityId, slug, base = null }) => {
  const b = { ...(base || {}) }
  for (const champ of SYSTEME) delete b[champ]
  const { startingPrice, duration, authorNote, difficultyLevel, imageSecondary, videoLinks, ...champs } = champsPorteur(payload)
  // Le texte du mot est au porteur. L'auteur (membre de l'équipe) est posé par
  // Odysway ; l'affixe aussi, tant que le porteur n'écrit pas le sien.
  const note = { ...(b.authorNote || {}) }
  delete note.text
  if (authorNote?.text) note.text = authorNote.text
  if (authorNote?.affixeAuthor) note.affixeAuthor = authorNote.affixeAuthor

  const doc = {
    ...b,
    _id: `drafts.${sanityId}`,
    _type: 'voyage',
    slug: b.slug?.current ? b.slug : { _type: 'slug', current: slug },
    availabilityTypes: ['custom'],
    portage: true,
    customPagePublished: b.customPagePublished === true,
    // Prix, durée, niveau, image secondaire et vidéos : sans valeur du porteur,
    // on garde celle qu'Odysway a pu poser dans le Studio.
    pricing: { ...(b.pricing || {}), startingPrice: startingPrice ?? b.pricing?.startingPrice },
    duration: duration ?? b.duration,
    difficultyLevel: difficultyLevel ?? b.difficultyLevel,
    imageSecondary: imageSecondary ?? b.imageSecondary,
    videoLinks: videoLinks ?? b.videoLinks,
    authorNote: Object.keys(note).length ? note : undefined,
  }
  // Un champ vidé par le porteur disparaît aussi du document.
  for (const [champ, valeur] of Object.entries(champs)) doc[champ] = valeur
  return sansIndefinis(doc)
}

/**
 * L'objet `voyage` que reçoivent les composants de /portage/<slug>, construit
 * depuis le brouillon : même forme que VOYAGE_QUERY (app/utils/voyagePageQueries.js),
 * asset d'image déplié comme le fait la requête.
 */
const versVoyageApercu = (payload, { slug, niveaux = [] } = {}) => {
  const { startingPrice, difficultyLevel, ...champs } = champsPorteur(payload)
  const deplier = img => (img?.asset?._ref ? { ...img, asset: { _ref: img.asset._ref, _id: img.asset._ref, _type: 'sanity.imageAsset' } } : img)
  const voyage = sansIndefinis({
    _id: 'apercu-portage',
    _type: 'voyage',
    slug: { _type: 'slug', current: slug || slugifier(champs.title) || 'apercu' },
    availabilityTypes: ['custom'],
    portage: true,
    customPagePublished: true,
    closingDays: 30,
    pricing: { startingPrice: startingPrice ?? null },
    badges: [],
    ...champs,
  })
  // VOYAGE_QUERY déréférence le niveau : `niveaux` est la liste lue dans Sanity.
  const niveau = difficultyLevel && niveaux.find(n => n._id === difficultyLevel._ref)
  if (niveau) voyage.difficultyLevel = { title: niveau.title, level: niveau.level, description: niveau.description }
  if (voyage.image) voyage.image = deplier(voyage.image)
  // DayCard exige une description : un jour sans texte en reçoit une vide.
  for (const jour of voyage.programmeBlock || []) jour.description ??= []
  return voyage
}

export default {
  LIMITES,
  CLE_PORTEUR,
  vide,
  nettoyer,
  lienVideo,
  manques,
  slugifier,
  texteEnBlocs,
  champsPorteur,
  versDocumentSanity,
  versVoyageApercu,
}
