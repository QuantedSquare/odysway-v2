// Brouillon de l'Espace porteur → document Sanity `voyage` (shared/portagePage.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import portagePage from '../../shared/portagePage.js'

const { nettoyer, manques, slugifier, texteEnBlocs, versDocumentSanity, versVoyageApercu, vide } = portagePage

const ref = n => `image-${String(n).repeat(40).slice(0, 40)}-1920x1080-jpg`

const payload = {
  titre: '  Yoga et randonnée en Crète  ',
  accroche: 'Une semaine de yoga face à la mer.',
  prixIndicatif: '1490',
  image: { ref: ref(1), alt: 'Plage de Balos' },
  galerie: [{ cle: 'ga1', ref: ref(2), alt: 'Coucher de soleil' }, { cle: 'ga2', ref: 'pas-une-ref' }],
  accompagnateur: { nom: 'Léa Martin', role: 'Professeure de yoga', presentation: 'Je pratique depuis 15 ans.', photo: { ref: ref(3) } },
  mot: 'Bienvenue !\n\nCe séjour, je l\'ai rêvé longtemps.\n- du yoga\n• de la marche',
  programme: [
    { cle: 'jA', titre: 'Arrivée à Chania', texte: 'Accueil à l\'aéroport.', nuit: 'à l\'hôtel', photo: { ref: ref(4) } },
    { cle: 'jB', titre: 'Gorges de Samaria', texte: '' },
  ],
  hebergements: [{ cle: 'h1', titre: 'Villa Elia', type: 'Villa', description: 'Chambres doubles.', photos: [{ cle: 'p1', ref: ref(5), alt: 'Terrasse' }] }],
  inclus: ['Les cours de yoga', '  ', 'Les repas'],
  nonInclus: ['Le vol'],
  faq: [{ cle: 'q1', question: 'Faut-il être sportif ?', reponse: 'Non.' }, { cle: 'q2', question: '', reponse: 'orpheline' }],
  inconnu: 'ignoré',
}

test('nettoyer : coupe, filtre, garde les clés valides, jamais d\'erreur', () => {
  const p = nettoyer(payload)
  assert.equal(p.titre, 'Yoga et randonnée en Crète')
  assert.equal(p.prixIndicatif, 1490)
  assert.equal(p.galerie.length, 1)
  assert.deepEqual(p.inclus, ['Les cours de yoga', 'Les repas'])
  assert.equal('inconnu' in p, false)
  assert.deepEqual(nettoyer(null), vide())
  assert.deepEqual(nettoyer('n\'importe quoi'), vide())
  assert.equal(nettoyer({ titre: 'x'.repeat(500) }).titre.length, 120)
  assert.equal(nettoyer({ prixIndicatif: -3 }).prixIndicatif, null)
  // Clés en double ou invalides : refaites, uniques.
  const cles = nettoyer({ faq: [{ cle: 'a', question: '1' }, { cle: 'a', question: '2' }, { cle: 'a b', question: '3' }] }).faq.map(q => q.cle)
  assert.equal(new Set(cles).size, 3)
})

test('manques : ce qu\'il faut avant de soumettre', () => {
  assert.deepEqual(manques(payload), [])
  assert.deepEqual(manques({}), ['le titre du séjour', 'l\'image principale', 'votre mot d\'accompagnateur', 'au moins un jour de programme'])
})

test('slugifier : comme le Studio', () => {
  assert.equal(slugifier('Yoga & randonnée en Crète !'), 'yoga-randonnee-en-crete')
  assert.equal(slugifier('  Œuvres d\'été  '), 'oeuvres-d-ete')
  assert.equal(slugifier(''), '')
})

test('texteEnBlocs : une ligne, un paragraphe ; « - » ou « • », une puce', () => {
  const blocs = texteEnBlocs('Bonjour\n\n- un\n• deux', 'k')
  assert.equal(blocs.length, 3)
  assert.deepEqual(blocs[0], {
    _key: 'kb0', _type: 'block', children: [{ _key: 'kb0s', _type: 'span', marks: [], text: 'Bonjour' }], markDefs: [], style: 'normal',
  })
  assert.equal(blocs[1].listItem, 'bullet')
  assert.equal(blocs[2].children[0].text, 'deux')
})

test('versDocumentSanity : brouillon neuf d\'un séjour en portage', () => {
  const doc = versDocumentSanity(payload, { sanityId: 'voyage-portage-abc', slug: 'yoga-et-randonnee-en-crete' })
  assert.equal(doc._id, 'drafts.voyage-portage-abc')
  assert.equal(doc._type, 'voyage')
  assert.deepEqual(doc.slug, { _type: 'slug', current: 'yoga-et-randonnee-en-crete' })
  assert.deepEqual(doc.availabilityTypes, ['custom'])
  assert.equal(doc.portage, true)
  assert.equal(doc.customPagePublished, false)
  assert.equal(doc.title, 'Yoga et randonnée en Crète')
  assert.equal(doc.description, 'Une semaine de yoga face à la mer.')
  assert.equal(doc.duration, 2)
  assert.deepEqual(doc.pricing, { startingPrice: 1490 })
  assert.deepEqual(doc.image, { _type: 'image', alt: 'Plage de Balos', asset: { _ref: ref(1), _type: 'reference' } })
  assert.deepEqual(doc.photosList, [{ _key: 'ga1', _type: 'image', alt: 'Coucher de soleil', asset: { _ref: ref(2), _type: 'reference' } }])
  assert.equal(doc.authorNote.text.length, 4)
  assert.equal(doc.authorNote.author, undefined)
  assert.equal(doc.accompanistsList[0].name, 'Léa Martin')
  assert.deepEqual(doc.accompanistsList[0].image, { _type: 'image', asset: { _ref: ref(3), _type: 'reference' } })
  assert.deepEqual(doc.programmeBlock.map(j => [j._key, j.badgeText, j.title]), [['jA', 'JOUR 1', 'Arrivée à Chania'], ['jB', 'JOUR 2', 'Gorges de Samaria']])
  assert.equal(doc.programmeBlock[0].night, 'à l\'hôtel')
  assert.equal('description' in doc.programmeBlock[1], false)
  assert.equal(doc.housingBlock[0].housingType, 'Villa')
  assert.equal(doc.housingBlock[0].image[0].alt, 'Terrasse')
  assert.deepEqual(doc.pricingDetailsBlock.listInclude.map(b => [b.listItem, b.children[0].text]), [['bullet', 'Les cours de yoga'], ['bullet', 'Les repas']])
  assert.deepEqual(doc.faqBlock.map(q => q.question), ['Faut-il être sportif ?'])
  // Aucun undefined : Sanity les refuserait.
  assert.equal(JSON.stringify(doc).includes('undefined'), false)
  assert.deepEqual(JSON.parse(JSON.stringify(doc)), doc)
})

test('versDocumentSanity : sur un document existant, ne touche que les champs du porteur', () => {
  const base = {
    _id: 'voyage-portage-abc',
    _rev: 'r1',
    _createdAt: '2026-10-01T00:00:00Z',
    _updatedAt: '2026-10-02T00:00:00Z',
    _type: 'voyage',
    title: 'Ancien titre',
    slug: { _type: 'slug', current: 'yoga-crete' },
    bmsReference: 'PO-CRE-1',
    destinations: [{ _key: 'd1', _type: 'reference', _ref: 'destination-grece' }],
    customPagePublished: true,
    pricing: { startingPrice: 1600, maxTravelers: 12 },
    authorNote: { author: { _ref: 'teamMember-romain', _type: 'reference' }, affixeAuthor: 'Fondateur', text: [] },
    duration: 7,
    videoLinks: ['https://youtu.be/x'],
    faqBlock: [{ _key: 'old', question: 'Ancienne' }],
  }
  const doc = versDocumentSanity({ ...payload, prixIndicatif: null, faq: [], programme: [] }, { sanityId: 'voyage-portage-abc', slug: 'autre-slug', base })

  assert.equal(doc._id, 'drafts.voyage-portage-abc')
  for (const champ of ['_rev', '_createdAt', '_updatedAt']) assert.equal(champ in doc, false)
  // Le lien déjà partagé ne change pas, la page en ligne le reste.
  assert.equal(doc.slug.current, 'yoga-crete')
  assert.equal(doc.customPagePublished, true)
  // Les champs d'Odysway sont gardés.
  assert.equal(doc.bmsReference, 'PO-CRE-1')
  assert.deepEqual(doc.destinations, base.destinations)
  assert.deepEqual(doc.videoLinks, base.videoLinks)
  assert.deepEqual(doc.pricing, { startingPrice: 1600, maxTravelers: 12 })
  assert.equal(doc.duration, 7)
  assert.deepEqual(doc.authorNote.author, base.authorNote.author)
  assert.equal(doc.authorNote.affixeAuthor, 'Fondateur')
  assert.equal(doc.authorNote.text.length, 4)
  // Ceux du porteur suivent le brouillon, y compris quand il les vide.
  assert.equal(doc.title, 'Yoga et randonnée en Crète')
  assert.equal('faqBlock' in doc, false)
  assert.equal('programmeBlock' in doc, false)
})

test('versDocumentSanity : mot vidé, la note d\'Odysway garde son auteur sans texte', () => {
  const base = { authorNote: { author: { _ref: 'teamMember-romain', _type: 'reference' }, text: [{ _key: 'x' }] } }
  const doc = versDocumentSanity({ titre: 'T' }, { sanityId: 'v', slug: 't', base })
  assert.deepEqual(doc.authorNote, { author: base.authorNote.author })
  assert.equal('authorNote' in versDocumentSanity({ titre: 'T' }, { sanityId: 'v', slug: 't' }), false)
})

test('versVoyageApercu : la forme de VOYAGE_QUERY, asset de l\'image principale déplié', () => {
  const voyage = versVoyageApercu(payload)
  assert.equal(voyage.slug.current, 'yoga-et-randonnee-en-crete')
  assert.equal(voyage.pricing.startingPrice, 1490)
  assert.equal(voyage.image.asset._id, ref(1))
  assert.equal(voyage.image.asset._ref, ref(1))
  assert.equal(voyage.photosList[0].asset._ref, ref(2))
  assert.deepEqual(voyage.badges, [])
  assert.equal(voyage.closingDays, 30)
  assert.equal(versVoyageApercu({}).pricing.startingPrice, null)
  assert.equal(versVoyageApercu({}, { slug: 'mon-slug' }).slug.current, 'mon-slug')
})

test('lienVideo : YouTube et Vimeo ramenés à l\'adresse d\'intégration, le reste refusé', () => {
  const { lienVideo } = portagePage
  assert.equal(lienVideo('https://www.youtube.com/watch?v=3aH6CsMkLGA&t=12s'), 'https://www.youtube.com/embed/3aH6CsMkLGA')
  assert.equal(lienVideo('https://youtu.be/3aH6CsMkLGA?si=x'), 'https://www.youtube.com/embed/3aH6CsMkLGA')
  assert.equal(lienVideo('https://youtube.com/shorts/3aH6CsMkLGA'), 'https://www.youtube.com/embed/3aH6CsMkLGA')
  assert.equal(lienVideo('https://www.youtube.com/embed/3aH6CsMkLGA'), 'https://www.youtube.com/embed/3aH6CsMkLGA')
  assert.equal(lienVideo('https://vimeo.com/123456789'), 'https://player.vimeo.com/video/123456789')
  assert.equal(lienVideo('https://exemple.com/video.mp4'), null)
  assert.equal(lienVideo('javascript:alert(1)'), null)
})

test('texteEnBlocs : **gras** et *italique* en marques', () => {
  const [b] = texteEnBlocs('Un séjour **unique** et *doux*', 'k')
  assert.deepEqual(b.children.map(s => [s.text, s.marks]), [
    ['Un séjour ', []], ['unique', ['strong']], [' et ', []], ['doux', ['em']],
  ])
  assert.equal(new Set(b.children.map(s => s._key)).size, 4)
  assert.deepEqual(texteEnBlocs('* une puce', 'k')[0].children.map(s => s.text), ['une puce'])
})

test('champs de la page voyage : niveau, image secondaire, vidéos, points forts, équipe, signature, détails du jour', () => {
  const complet = {
    ...payload,
    niveau: 'fbd1deb6-4d20-450a-b49f-960231cea5db',
    imageSecondaire: { ref: ref(6), alt: 'Salle de yoga' },
    videos: ['https://youtu.be/3aH6CsMkLGA', 'https://www.youtube.com/embed/3aH6CsMkLGA', 'pas une vidéo'],
    pointsForts: ['Yoga **face à la mer**', ''],
    equipeIntro: 'Nous serons deux.',
    equipe: [{ cle: 'a1', nom: 'Nikos', role: 'Guide', presentation: 'Crétois.' }, { cle: 'a2', nom: '' }],
    motSignature: 'fondatrice de Shanti',
    programme: [{ cle: 'jA', etiquette: 'JOURS 1 À 2', titre: 'Arrivée', denivele: '+300 m', trajet: '1 h de route', nuit: 'à l\'hôtel' }],
  }
  const doc = versDocumentSanity(complet, { sanityId: 'v', slug: 's' })
  assert.deepEqual(doc.difficultyLevel, { _type: 'reference', _ref: 'fbd1deb6-4d20-450a-b49f-960231cea5db' })
  assert.equal(doc.imageSecondary.asset._ref, ref(6))
  assert.equal(doc.imageSecondary.alt, 'Salle de yoga')
  assert.deepEqual(doc.videoLinks, ['https://www.youtube.com/embed/3aH6CsMkLGA'])
  assert.deepEqual(doc.experiencesBlock.map(b => [b.listItem, b.children.map(s => s.text).join('')]), [['bullet', 'Yoga face à la mer']])
  assert.equal(doc.accompanistsDescription[0].children[0].text, 'Nous serons deux.')
  assert.deepEqual(doc.accompanistsList.map(a => [a._key, a.name]), [['porteur', 'Léa Martin'], ['a1', 'Nikos']])
  assert.equal(doc.authorNote.affixeAuthor, 'fondatrice de Shanti')
  assert.deepEqual(doc.programmeBlock[0], {
    _key: 'jA', title: 'Arrivée', badgeText: 'JOURS 1 À 2', denivellation: '+300 m', road: '1 h de route', night: 'à l\'hôtel',
  })
  assert.equal(nettoyer({ niveau: 'x y' }).niveau, null)

  // L'aperçu déplie le niveau depuis la liste lue dans Sanity.
  const niveaux = [{ _id: 'fbd1deb6-4d20-450a-b49f-960231cea5db', title: 'Premiers pas', level: 1, description: [] }]
  assert.deepEqual(versVoyageApercu(complet, { niveaux }).difficultyLevel, { title: 'Premiers pas', level: 1, description: [] })
  assert.equal(versVoyageApercu(complet).difficultyLevel, undefined)
})

test('versDocumentSanity : niveau, image secondaire, vidéos et affixe d\'Odysway gardés si le porteur n\'en donne pas', () => {
  const base = {
    difficultyLevel: { _type: 'reference', _ref: 'niveau-odysway' },
    imageSecondary: { _type: 'image', asset: { _ref: ref(7), _type: 'reference' } },
    videoLinks: ['https://www.youtube.com/embed/JKpO_UqYveA'],
    authorNote: { affixeAuthor: 'Fondateur' },
  }
  const doc = versDocumentSanity(payload, { sanityId: 'v', slug: 's', base })
  assert.deepEqual(doc.difficultyLevel, base.difficultyLevel)
  assert.deepEqual(doc.imageSecondary, base.imageSecondary)
  assert.deepEqual(doc.videoLinks, base.videoLinks)
  assert.equal(doc.authorNote.affixeAuthor, 'Fondateur')
  const remplace = versDocumentSanity({ ...payload, motSignature: 'autre' }, { sanityId: 'v', slug: 's', base })
  assert.equal(remplace.authorNote.affixeAuthor, 'autre')
})
