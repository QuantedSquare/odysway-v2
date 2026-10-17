import {defineArrayMember, defineField, defineType} from 'sanity'

// Page /partenariat : un seul document. Les ancres de la sous-navigation
// (#partenaires, #cadre, #preuves, #modeles, #faq, #contact) sont fixées dans
// le code ; seuls leurs libellés sont éditables ici.

// Paragraphes simples : gras, italique et lien, sans titres ni listes.
const paragraphs = {
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Gras', value: 'strong'},
          {title: 'Italique', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Lien',
            fields: [{name: 'href', type: 'url', title: 'URL', validation: (rule: any) => rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})}],
          },
        ],
      },
    }),
  ],
}

const stringList = {
  type: 'array',
  of: [defineArrayMember({type: 'string'})],
}

const imageWithAlt = {
  type: 'image',
  options: {hotspot: true},
  fields: [defineField({name: 'alt', title: 'Texte alternatif', type: 'string'})],
}

export const pagePartenariatType = defineType({
  name: 'page_partenariat',
  title: 'Page Partenariat',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'subnav', title: 'Sous-navigation'},
    {name: 'partenaires', title: 'Nos partenaires'},
    {name: 'cadre', title: "L'agence Odysway"},
    {name: 'preuves', title: 'Exemples & avis'},
    {name: 'modeles', title: 'Comment ça marche'},
    {name: 'faq', title: 'FAQ'},
    {name: 'contact', title: 'Formulaire'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),

    // ---------------- Hero ----------------
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'image', title: 'Photo de fond', ...imageWithAlt}),
        defineField({name: 'title', title: 'Titre (H1)', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'leads', title: 'Paragraphes', ...stringList}),
        defineField({name: 'punch', title: 'Phrase d\'accroche (en gras)', type: 'text', rows: 2}),
        defineField({name: 'ctaText', title: 'Texte du bouton', type: 'string'}),
        defineField({
          name: 'trustItems',
          title: 'Chiffres de confiance',
          type: 'array',
          validation: (rule) => rule.max(4),
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'value', title: 'Valeur (en gras)', type: 'string'}),
                defineField({name: 'label', title: 'Libellé', type: 'string'}),
              ],
              preview: {select: {title: 'value', subtitle: 'label'}},
            }),
          ],
        }),
      ],
    }),

    // ---------------- Sous-navigation ----------------
    defineField({
      name: 'subnav',
      title: 'Sous-navigation',
      type: 'object',
      group: 'subnav',
      description: 'Bande collante sous le header. Chaque lien fait défiler jusqu\'à sa section.',
      fields: [
        defineField({name: 'label', title: 'Libellé à gauche', type: 'string'}),
        defineField({name: 'partenaires', title: 'Lien « Nos partenaires »', type: 'string'}),
        defineField({name: 'cadre', title: 'Lien « L\'agence Odysway »', type: 'string'}),
        defineField({name: 'preuves', title: 'Lien « Exemples »', type: 'string'}),
        defineField({name: 'modeles', title: 'Lien « Comment ça marche »', type: 'string'}),
        defineField({name: 'faq', title: 'Lien « Questions »', type: 'string'}),
        defineField({name: 'ctaText', title: 'Texte du bouton (vers le formulaire)', type: 'string'}),
      ],
    }),

    // ---------------- Nos partenaires ----------------
    defineField({
      name: 'partenaires',
      title: 'Nos partenaires',
      type: 'object',
      group: 'partenaires',
      fields: [
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({name: 'text', title: 'Texte', ...paragraphs}),
        defineField({name: 'profiles', title: 'Profils (pastilles)', ...stringList}),
        defineField({name: 'momentTitle', title: 'Encart : titre', type: 'string'}),
        defineField({name: 'momentItems', title: 'Encart : points', ...stringList}),
      ],
    }),

    // ---------------- L'agence Odysway ----------------
    defineField({
      name: 'cadre',
      title: "L'agence Odysway",
      type: 'object',
      group: 'cadre',
      fields: [
        defineField({name: 'image', title: 'Photo de fond', ...imageWithAlt}),
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({name: 'text', title: 'Texte', ...paragraphs}),
        defineField({name: 'includedTitle', title: 'Colonne 1 : titre', type: 'string'}),
        defineField({name: 'includedItems', title: 'Colonne 1 : points', ...stringList}),
        defineField({name: 'scopeTitle', title: 'Colonne 2 : titre', type: 'string'}),
        defineField({name: 'scopeItems', title: 'Colonne 2 : points', ...stringList}),
        defineField({name: 'priceLabel', title: 'Rémunération : surtitre', type: 'string'}),
        defineField({name: 'priceRate', title: 'Rémunération : taux', type: 'string'}),
        defineField({name: 'priceNote', title: 'Rémunération : détail', ...paragraphs}),
        defineField({name: 'footnote', title: 'Note sous la rémunération', type: 'text', rows: 3}),
        defineField({name: 'ctaText', title: 'Texte du bouton', type: 'string'}),
        defineField({name: 'ctaNote', title: 'Phrase à côté du bouton', type: 'string'}),
      ],
    }),

    // ---------------- Exemples & avis ----------------
    defineField({
      name: 'preuves',
      title: 'Exemples de partenariats',
      type: 'object',
      group: 'preuves',
      fields: [
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({
          name: 'cases',
          title: 'Cas partenaires',
          description: 'Accord écrit du partenaire requis pour le nom, la photo et la citation.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'partnerCase',
              fields: [
                defineField({name: 'image', title: 'Photo', ...imageWithAlt}),
                defineField({name: 'who', title: 'Profil du partenaire', type: 'string'}),
                defineField({name: 'title', title: 'Type de séjour', type: 'string'}),
                defineField({name: 'inPlaceLabel', title: 'Libellé « Déjà en place »', type: 'string', initialValue: 'Déjà en place'}),
                defineField({name: 'inPlace', title: 'Déjà en place', type: 'string'}),
                defineField({name: 'odyswayLabel', title: 'Libellé « Part Odysway »', type: 'string', initialValue: 'Part Odysway'}),
                defineField({name: 'odysway', title: 'Part Odysway', type: 'string'}),
                defineField({
                  name: 'stats',
                  title: 'Chiffres',
                  type: 'array',
                  validation: (rule) => rule.max(3),
                  of: [
                    defineArrayMember({
                      type: 'object',
                      fields: [
                        defineField({name: 'value', title: 'Valeur', type: 'string'}),
                        defineField({name: 'label', title: 'Libellé', type: 'string'}),
                      ],
                      preview: {select: {title: 'value', subtitle: 'label'}},
                    }),
                  ],
                }),
                defineField({name: 'quote', title: 'Citation', type: 'text', rows: 3}),
                defineField({name: 'author', title: 'Auteur de la citation', type: 'string'}),
              ],
              preview: {select: {title: 'title', subtitle: 'who', media: 'image'}},
            }),
          ],
        }),
        defineField({name: 'reviewsTitle', title: 'Avis : titre', type: 'string'}),
        defineField({name: 'reviewsScore', title: 'Avis : note', type: 'string', description: 'Ex. : 4,9'}),
        defineField({name: 'reviewsScoreLabel', title: 'Avis : libellé de la note', type: 'string', description: 'Ex. : sur Trustpilot'}),
        defineField({
          name: 'reviews',
          title: 'Avis voyageurs',
          description: 'Avis vérifiés existants. Garder un avis 4 étoiles dans le lot.',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'review'}]})],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),

    // ---------------- Comment ça marche ----------------
    defineField({
      name: 'modeles',
      title: 'Comment ça marche',
      type: 'object',
      group: 'modeles',
      fields: [
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({name: 'lead', title: 'Introduction', type: 'text', rows: 2}),
        defineField({
          name: 'steps',
          title: 'Étapes',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Numéro', type: 'string', description: 'Ex. : ÉTAPE 01'}),
                defineField({name: 'title', title: 'Titre', type: 'string'}),
                defineField({name: 'text', title: 'Texte', type: 'text', rows: 3}),
                defineField({name: 'when', title: 'Durée / moment', type: 'string'}),
              ],
              preview: {select: {title: 'title', subtitle: 'label'}},
            }),
          ],
        }),
        defineField({name: 'ctaText', title: 'Texte du bouton', type: 'string'}),
      ],
    }),

    // ---------------- FAQ ----------------
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'object',
      group: 'faq',
      fields: [
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({
          name: 'questions',
          title: 'Questions',
          description: 'La première question est ouverte par défaut.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'question', title: 'Question', type: 'string'}),
                defineField({name: 'answer', title: 'Réponse', type: 'text', rows: 4}),
              ],
              preview: {select: {title: 'question'}},
            }),
          ],
        }),
      ],
    }),

    // ---------------- Formulaire ----------------
    defineField({
      name: 'contact',
      title: 'Formulaire de contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'image', title: 'Photo de fond', ...imageWithAlt}),
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'string'}),
        defineField({name: 'title', title: 'Titre', type: 'string'}),
        defineField({name: 'lead', title: 'Introduction', type: 'text', rows: 3}),
        defineField({name: 'bullets', title: 'Engagements', ...stringList}),
        defineField({name: 'formTitle', title: 'Formulaire : titre', type: 'string'}),
        defineField({name: 'formSubtitle', title: 'Formulaire : sous-titre', type: 'string'}),
        defineField({
          name: 'fields',
          title: 'Champs du formulaire',
          type: 'object',
          options: {collapsible: true, collapsed: true},
          fields: ['concept', 'destination', 'communaute', 'participants', 'besoin', 'email'].map((name) =>
            defineField({
              name,
              title: `Champ « ${name} »`,
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Libellé', type: 'string'}),
                defineField({name: 'placeholder', title: 'Texte indicatif', type: 'string'}),
              ],
            }),
          ),
        }),
        defineField({
          name: 'besoinOptions',
          title: 'Choix du champ « Ce que vous aimeriez déléguer »',
          description: 'Sert à qualifier le lead (10 % / 15 %).',
          ...stringList,
        }),
        defineField({name: 'submitText', title: 'Texte du bouton d\'envoi', type: 'string'}),
        defineField({name: 'legal', title: 'Mention sous le bouton', type: 'string'}),
        defineField({name: 'successTitle', title: 'Confirmation : titre', type: 'string'}),
        defineField({name: 'successText', title: 'Confirmation : texte', type: 'text', rows: 2}),
        defineField({name: 'errorText', title: 'Message d\'erreur', type: 'string'}),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Page Partenariat'}),
  },
})
