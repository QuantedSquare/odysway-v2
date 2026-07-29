import {defineField, defineType} from 'sanity'

// Rich-text config shared by the legacy portable-text sections below.
const legacyBlockContent = [
  {
    type: 'block' as const,
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'H2', value: 'h2'},
      {title: 'H3', value: 'h3'},
    ],
    lists: [
      {title: 'Bullet', value: 'bullet'},
      {title: 'Number', value: 'number'},
    ],
    marks: {
      decorators: [
        {title: 'Strong', value: 'strong'},
        {title: 'Emphasis', value: 'em'},
      ],
      annotations: [
        {
          title: 'URL',
          name: 'link',
          type: 'object',
          fields: [{title: 'URL', name: 'href', type: 'url'}],
        },
      ],
    },
  },
  {
    type: 'image' as const,
    options: {hotspot: true},
    fields: [
      {name: 'alt', type: 'string', title: 'Alt Text'},
      {name: 'caption', type: 'string', title: 'Caption'},
    ],
  },
]

export const visionVoyageOdyswayType = defineType({
  name: 'visionVoyageOdysway',
  title: 'Vision Voyage Odysway',
  type: 'document',
  groups: [
    {
      name: 'hero',
      title: '1. Hero',
      default: true,
    },
    {
      name: 'story',
      title: '2. Récit fondateur',
    },
    {
      name: 'direction',
      title: '3. Notre direction',
    },
    {
      name: 'values',
      title: '4. Nos valeurs',
    },
    {
      name: 'gallery',
      title: '5. Galerie voyageurs',
    },
    {
      name: 'team',
      title: '6. Une équipe à taille humaine',
    },
    {
      name: 'trustBand',
      title: '7. Bandeau de réassurance',
    },
    {
      name: 'cta',
      title: '8. Bloc CTA',
    },
    {
      name: 'seo',
      title: 'SEO Settings',
    },
    {
      name: 'legacy',
      title: '⚠️ Sections obsolètes (non affichées)',
    },
  ],
  fields: [
    // ----------------------------------------------------------------
    // 1. Hero
    // ----------------------------------------------------------------
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'image',
          title: 'Image du hero',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Titre (H1)',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre',
          type: 'text',
          rows: 2,
          description: 'Phrase d\'accroche affichée sous le titre du hero.',
        }),
        // LEGACY #
        defineField({
          name: 'titleColor',
          title: 'Title Color',
          type: 'string',
          hidden: true,
          initialValue: 'white',
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 2. Récit fondateur (blocs texte + image, alternés)
    // ----------------------------------------------------------------
    defineField({
      name: 'storySections',
      title: 'Blocs du récit',
      type: 'array',
      group: 'story',
      description: 'Chaque bloc affiche une image et un texte, côte à côte.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Sur-titre',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'Titre (H2)',
              type: 'string',
            }),
            defineField({
              name: 'paragraphs',
              title: 'Paragraphes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Texte',
                      type: 'text',
                      rows: 4,
                    }),
                    defineField({
                      name: 'quote',
                      title: 'Citation mise en avant',
                      type: 'boolean',
                      description: 'Affiche le paragraphe en italique, avec une barre orange à gauche.',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: {title: 'text', quote: 'quote'},
                    prepare: ({title, quote}) => ({
                      title: title,
                      subtitle: quote ? 'Citation' : 'Paragraphe',
                    }),
                  },
                },
              ],
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
              fields: [{name: 'alt', type: 'string', title: 'Alt Text'}],
            }),
            defineField({
              name: 'reverse',
              title: 'Image à droite',
              type: 'boolean',
              description: 'Par défaut l\'image est à gauche du texte.',
              initialValue: false,
            }),
            defineField({
              name: 'showSignature',
              title: 'Afficher la signature du fondateur',
              type: 'boolean',
              description: 'Utilise la photo et la légende de la section "Fondateur".',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'title', media: 'image'},
          },
        },
      ],
    }),

    defineField({
      name: 'founderSection',
      title: 'Fondateur (signature)',
      type: 'object',
      group: 'story',
      fields: [
        defineField({
          name: 'image',
          title: 'Photo du fondateur',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'caption',
          title: 'Légende',
          type: 'string',
          description: 'Format "Prénom, rôle" — la partie avant la virgule est affichée en gras.',
          initialValue: 'Romain, fondateur d\'Odysway',
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 3. Notre direction (bandeau crème)
    // ----------------------------------------------------------------
    defineField({
      name: 'directionSection',
      title: 'Notre direction',
      type: 'object',
      group: 'direction',
      fields: [
        defineField({name: 'eyebrow', title: 'Sur-titre', type: 'string'}),
        defineField({name: 'title', title: 'Titre (H2)', type: 'string'}),
        defineField({
          name: 'paragraphs',
          title: 'Paragraphes',
          type: 'array',
          of: [{type: 'text'}],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 4. Nos valeurs (4 cartes)
    // ----------------------------------------------------------------
    defineField({
      name: 'valuesSection',
      title: 'Nos valeurs',
      type: 'object',
      group: 'values',
      fields: [
        defineField({name: 'eyebrow', title: 'Sur-titre', type: 'string'}),
        defineField({name: 'title', title: 'Titre (H2)', type: 'string'}),
        defineField({
          name: 'items',
          title: 'Valeurs',
          type: 'array',
          validation: (Rule) => Rule.max(4),
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icône',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Œil (transparence)', value: 'eye'},
                      {title: 'Bouclier (confiance)', value: 'shield'},
                      {title: 'Cœur (chaleur)', value: 'heart'},
                      {title: 'Boussole (justesse)', value: 'compass'},
                      {title: 'Feuille (engagement)', value: 'leaf'},
                      {title: 'Personnes (équipe)', value: 'users'},
                    ],
                  },
                }),
                defineField({name: 'title', title: 'Titre', type: 'string'}),
                defineField({name: 'text', title: 'Description', type: 'text', rows: 3}),
              ],
              preview: {
                select: {title: 'title', subtitle: 'text'},
              },
            },
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 5. Galerie voyageurs (mosaïque + lightbox)
    // ----------------------------------------------------------------
    defineField({
      name: 'gallerySection',
      title: 'Galerie voyageurs',
      type: 'object',
      group: 'gallery',
      description:
        'Chaque case est soit une photo libre, soit un voyage / une destination '
        + '(sa photo est reprise et la case devient cliquable). Avec 8 cases, la '
        + 'mosaïque se remplit exactement. Si la liste est vide, les photos des '
        + 'avis voyageurs sont utilisées.',
      fields: [
        defineField({name: 'eyebrow', title: 'Sur-titre', type: 'string'}),
        defineField({name: 'title', title: 'Titre (H2)', type: 'string'}),
        defineField({
          name: 'items',
          title: 'Cases de la mosaïque',
          type: 'array',
          validation: (Rule) => Rule.max(8),
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'voyage',
                  title: 'Voyage',
                  type: 'reference',
                  to: [{type: 'voyage'}],
                  description: 'La case reprend la photo du voyage et renvoie vers sa page.',
                }),
                defineField({
                  name: 'destination',
                  title: 'Destination',
                  type: 'reference',
                  to: [{type: 'destination'}],
                  description: 'Idem pour une destination. Laisser vide si un voyage est choisi.',
                }),
                defineField({
                  name: 'image',
                  title: 'Photo',
                  type: 'image',
                  options: {hotspot: true},
                  description: 'Photo libre, ou remplacement de celle du voyage / de la destination.',
                  fields: [{name: 'alt', type: 'string', title: 'Alt Text'}],
                }),
                defineField({
                  name: 'caption',
                  title: 'Légende',
                  type: 'string',
                  description: 'Par défaut : le nom du voyage / de la destination.',
                }),
                defineField({
                  name: 'size',
                  title: 'Format dans la mosaïque',
                  type: 'string',
                  description: 'Laisser vide pour garder la mosaïque automatique.',
                  options: {
                    list: [
                      {title: 'Carré', value: 'plain'},
                      {title: 'Large (2 colonnes)', value: 'wide'},
                      {title: 'Haut (2 lignes)', value: 'tall'},
                    ],
                  },
                }),
              ],
              preview: {
                select: {
                  caption: 'caption',
                  voyage: 'voyage.title',
                  destination: 'destination.title',
                  media: 'image',
                  voyageMedia: 'voyage.image',
                  destinationMedia: 'destination.image',
                },
                prepare({caption, voyage, destination, media, voyageMedia, destinationMedia}) {
                  return {
                    title: caption || voyage || destination || 'Photo',
                    subtitle: voyage ? 'Voyage' : destination ? 'Destination' : 'Photo libre',
                    media: media || voyageMedia || destinationMedia,
                  }
                },
              },
            },
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 6. Une équipe à taille humaine
    // ----------------------------------------------------------------
    defineField({
      name: 'teamSection',
      title: 'Une équipe à taille humaine',
      type: 'object',
      group: 'team',
      description: 'Les avatars affichés proviennent des documents "Team Member".',
      fields: [
        defineField({name: 'eyebrow', title: 'Sur-titre', type: 'string'}),
        defineField({name: 'title', title: 'Titre (H2)', type: 'string'}),
        defineField({
          name: 'paragraphs',
          title: 'Paragraphes',
          type: 'array',
          of: [{type: 'text'}],
        }),
        defineField({
          name: 'image',
          title: 'Photo de l\'équipe',
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', type: 'string', title: 'Alt Text'}],
        }),
        defineField({
          name: 'ctaButton',
          title: 'Bouton',
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Texte', type: 'string'}),
            defineField({name: 'link', title: 'Lien', type: 'string'}),
          ],
        }),
        // LEGACY # — ancien contenu rich-text, remplacé par les champs ci-dessus.
        defineField({
          name: 'content',
          title: 'Contenu (obsolète)',
          type: 'array',
          hidden: true,
          of: legacyBlockContent,
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 7. Bandeau de réassurance
    // ----------------------------------------------------------------
    defineField({
      name: 'trustBand',
      title: 'Bandeau de réassurance',
      type: 'object',
      group: 'trustBand',
      description: 'Si vide, les éléments par défaut du site sont affichés.',
      fields: [
        defineField({
          name: 'items',
          title: 'Éléments de réassurance',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icône',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Étoile (note)', value: 'star'},
                      {title: 'Bulle (avis)', value: 'message'},
                      {title: 'Bouclier (garantie)', value: 'shield'},
                      {title: 'Coche (immatriculation)', value: 'check'},
                      {title: 'Calendrier (ancienneté)', value: 'calendar'},
                      {title: 'Cœur', value: 'heart'},
                    ],
                  },
                }),
                defineField({name: 'textBefore', title: 'Texte avant (normal)', type: 'string'}),
                defineField({name: 'boldText', title: 'Texte en gras', type: 'string'}),
                defineField({name: 'text', title: 'Texte après (normal)', type: 'string'}),
              ],
              preview: {
                select: {before: 'textBefore', bold: 'boldText', after: 'text'},
                prepare: ({before, bold, after}) => ({
                  title: [before, bold, after].filter(Boolean).join(' '),
                }),
              },
            },
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 8. Bloc CTA
    // ----------------------------------------------------------------
    defineField({
      name: 'ctaSection',
      title: 'Bloc CTA',
      type: 'object',
      group: 'cta',
      fields: [
        defineField({name: 'title', title: 'Titre (H2)', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
        defineField({
          name: 'primaryCta',
          title: 'Bouton principal',
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Texte', type: 'string'}),
            defineField({name: 'link', title: 'Lien', type: 'string'}),
          ],
        }),
        defineField({
          name: 'secondaryCta',
          title: 'Bouton secondaire',
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Texte', type: 'string'}),
            defineField({name: 'link', title: 'Lien', type: 'string'}),
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // SEO
    // ----------------------------------------------------------------
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
      description: 'Configuration SEO pour la page vision voyage odysway',
    }),

    // ----------------------------------------------------------------
    // Sections obsolètes — conservées pour ne pas perdre l'ancien contenu.
    // Elles ne sont plus affichées sur le site.
    // ----------------------------------------------------------------
    defineField({
      name: 'priseDeConscience',
      title: 'Prise de conscience (obsolète)',
      type: 'object',
      group: 'legacy',
      description: 'Remplacé par les blocs du récit fondateur.',
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: legacyBlockContent,
        }),
      ],
    }),

    defineField({
      name: 'ceQueOnDefend',
      title: 'Ce que l\'on défend (obsolète)',
      type: 'object',
      group: 'legacy',
      description: 'Remplacé par la section "Notre direction".',
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: legacyBlockContent,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heroSection.title',
    },
  },
})
