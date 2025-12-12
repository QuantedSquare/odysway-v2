import { defineField, defineType } from 'sanity'

// Shared block configuration with alignment options
const richTextBlock = {
  type: 'block',
  title: 'Bloc de texte',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'H4', value: 'h4' },
    { title: 'Citation', value: 'blockquote' },
  ],
}

export const homePageType = defineType({
  name: 'homePage',
  title: "Page d'Accueil",
  preview: {
    prepare() {
      return {
        title: 'Page d\'Accueil',
        subtitle: 'Textes et sections de la page d\'accueil'
      }
    }
  },
  type: 'document',
  groups: [
    {
      name: 'hero',
      title: 'Hero Section',
      default: true,
    },
    {
      name: 'heroTest',
      title: 'Hero Section sur Preprod',
    },
    {
      name: 'experienceCarousel',
      title: 'Experience Carousel',
    },
    {
      name: 'franceTrips',
      title: 'Premier carousel de voyages',
    },
    {
      name: 'followDesires',
      title: 'Section suivez vos envies / catégories thématiques',
    },
    {
      name: 'travelDifferently',
      title: 'Section voyager, autrement, icons et textes',
    },
    {
      name: 'guaranteedDepartures',
      title: 'Deuxième carousel de voyages',
    },
    {
      name: 'summerTravel',
      title: 'Troisième carousel de voyages',
    },
    {
      name: 'newsletter',
      title: 'Section newsletter',
    },
    {
      name: 'unforgettableTravels',
      title: 'Quatrième carousel de voyages',
    },
    {
      name: 'reviews',
      title: 'Section reviews',
    },
    {
      name: 'contact',
      title: 'Section contact',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],

  fields: [
    // SEO Settings
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
      description: 'Configuration SEO pour la page d\'accueil (og:type = "website", structuredData = "Organization")',
    }),

    // Hero Section
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'image',
          title: 'Image Hero',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'imageMobile',
          title: 'Image Hero Mobile',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Titre Hero',
          type: 'array',
          of: [richTextBlock],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre Hero',
          type: 'array',
          of: [richTextBlock],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'typewritterWords',
          title: 'Mots pour l\'effet typewritter',
          type: 'array',
          of: [{ type: 'string' }],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'placeholder',
          title: 'Placeholder de la recherche',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'heroSectionTest',
      title: 'Hero Section sur Preprod',
      type: 'object',
      group: 'heroTest',
      fields: [
        defineField({
          name: 'image',
          title: 'Image Hero',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'imageMobile',
          title: 'Image Hero Mobile',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Titre Hero',
          type: 'array',
          of: [richTextBlock],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre Hero',
          type: 'array',
          of: [richTextBlock],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'typewritterWords',
          title: 'Mots pour l\'effet typewritter',
          type: 'array',
          of: [{ type: 'string' }],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'placeholder',
          title: 'Placeholder de la recherche',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    // Experience Carousel
    defineField({
      name: 'experienceCarousel',
      title: "Carousel d'Expériences",
      type: 'object',
      group: 'experienceCarousel',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'experiences',
          title: 'Expériences',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'experience' }] }],
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    // France Trips Section
    defineField({
      name: 'franceTrips',
      title: 'Séjours en France',
      type: 'object',
      group: 'franceTrips',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'voyagesFrance',
          title: 'Voyages',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // Follow Your Desires Section
    defineField({
      name: 'followDesires',
      title: 'Suivez vos envies',
      type: 'object',
      group: 'followDesires',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'categoriesFollowDesires',
          title: 'Catégories',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'category' }] }],
        }),
      ],
    }),

    // Travel Differently Section
    defineField({
      name: 'travelDifferently',
      title: 'Voyager, autrement',
      type: 'object',
      group: 'travelDifferently',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'image',
          title: 'Image principale',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'features',
          title: "Section d'icons et textes",
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icône',
                  type: 'image',
                  options: {
                    hotspot: true,
                  },
                }),
                defineField({
                  name: 'text',
                  title: "Texte à côté de l'icône",
                  type: 'string',
                }),
              ],
            },
          ],
        }),
        defineField({
          name: 'ctaButton',
          title: 'Bouton CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte du bouton',
              type: 'string',
            }),
            defineField({
              name: 'link',
              title: 'Lien du bouton',
              type: 'string',
            }),
            defineField({
              name: 'color',
              title: 'Couleur du bouton',
              type: 'string',
            }),
          ],
        }),
      ],
    }),

    // Guaranteed Departures Section
    defineField({
      name: 'guaranteedDepartures',
      title: 'Départs Garantis',
      type: 'object',
      group: 'guaranteedDepartures',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'voyagesGuaranteedDepartures',
          title: 'Liste des voyages garantis',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // Summer Travel Section
    defineField({
      name: 'summerTravel',
      title: 'Voyager cet été',
      type: 'object',
      group: 'summerTravel',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'voyagesSummerTravel',
          title: 'Liste des voyages',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // Newsletter Section
    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      group: 'newsletter',
      fields: [
        defineField({
          name: 'title',
          title: 'Texte dans la section Newsletter',
          type: 'array',
          of: [richTextBlock],
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre dans la section Newsletter',
          type: 'array',
          of: [richTextBlock],
        }),
      ],
    }),



    // Unforgettable Travels Section
    defineField({
      name: 'unforgettableTravels',
      title: 'Voyages Inoubliables',
      type: 'object',
      group: 'unforgettableTravels',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre dans la section',
          type: 'string',
        }),
        defineField({
          name: 'voyagesUnforgettableTravels',
          title: 'Liste des voyages',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // Reviews Section
    defineField({
      name: 'reviews',
      title: 'Témoignages',
      type: 'object',
      group: 'reviews',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'reviews',
          title: 'Liste des reviews',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'review' }] }],
        }),
        defineField({
          name: 'ctaText',
          title: 'Texte CTA',
          type: 'string',
        }),
      ],
    }),

    // Contact Section
    defineField({
      name: 'contact',
      title: 'Section Contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'string',
        }),
        defineField({
          name: 'ctaButton',
          title: 'Bouton CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte du bouton',
              type: 'string',
            }),
            defineField({
              name: 'link',
              title: 'Lien du bouton',
              type: 'string',
            }),
            defineField({
              name: 'color',
              title: 'Couleur du bouton',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
})
