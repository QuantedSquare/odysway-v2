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
  // Groups are ordered to match the on-page display order in app/pages/index.vue.
  groups: [
    {
      name: 'hero',
      title: '1. Hero Section',
      default: true,
    },
    {
      name: 'heroTest',
      title: '1b. Hero Section sur Preprod',
    },
    {
      name: 'trustBand',
      title: '2. Bandeau de réassurance',
    },
    {
      name: 'momentSection',
      title: '3. Séjours du moment (mosaïque)',
    },
    {
      name: 'concept',
      title: '4. Concept / manifeste',
    },
    {
      name: 'guaranteedDepartures',
      title: '5. Départs garantis (carousel)',
    },
    {
      name: 'lastMinute',
      title: '6. Dernières places',
    },
    {
      name: 'followDesires',
      title: '7. Suivez vos envies / catégories thématiques',
    },
    {
      name: 'bestSellers',
      title: '8. Best-sellers',
    },
    {
      name: 'franceTrips',
      title: '9. Séjours en France (carousel)',
    },
    {
      name: 'contact',
      title: '10. Section contact',
    },
    {
      name: 'reviews',
      title: '11. Section reviews',
    },
    {
      name: 'newsletter',
      title: '12. Section newsletter',
    },
    {
      name: 'seoText',
      title: '13. Texte SEO (bas de page)',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
    // Groupes obsolètes / non affichés (masqués).
    {
      name: 'legacy',
      title: '⚠️ Sections obsolètes (non affichées)',
    },
  ],

  fields: [
    // ----------------------------------------------------------------
    // 1. Hero Section
    // ----------------------------------------------------------------
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

    // ----------------------------------------------------------------
    // 1b. Hero Section (Preprod)
    // ----------------------------------------------------------------
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
        // LEGACY #
        defineField({
          name: 'typewritterWords',
          title: 'Mots pour l\'effet typewritter',
          type: 'array',
          of: [{ type: 'string' }],
          validation: (rule) => rule.required(),
          hidden: true,
        }),
        // LEGACY #
        defineField({
          name: 'placeholder',
          title: 'Placeholder de la recherche',
          type: 'string',
          validation: (rule) => rule.required(),
          hidden: true,
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 2. Trust Band (réassurance)
    // ----------------------------------------------------------------
    defineField({
      name: 'trustBand',
      title: 'Bandeau de réassurance',
      type: 'object',
      group: 'trustBand',
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
                      { title: 'Étoile (note)', value: 'star' },
                      { title: 'Bulle (avis)', value: 'message' },
                      { title: 'Bouclier (garantie)', value: 'shield' },
                      { title: 'Coche (immatriculation)', value: 'check' },
                      { title: 'Calendrier (ancienneté)', value: 'calendar' },
                      { title: 'Cœur', value: 'heart' },
                    ],
                  },
                }),
                defineField({
                  name: 'textBefore',
                  title: 'Texte avant le gras (ex. Garantie, Immatriculée)',
                  type: 'string',
                }),
                defineField({
                  name: 'boldText',
                  title: 'Texte en gras (ex. 4,9/5 ou APST)',
                  type: 'string',
                }),
                defineField({
                  name: 'text',
                  title: 'Texte après le gras (ex. sur Trustpilot)',
                  type: 'string',
                }),
              ],
              preview: {
                select: { title: 'boldText', subtitle: 'text' },
              },
            },
          ],
          validation: (rule) => rule.max(6),
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 3. Moment Section (mosaïque séjours du moment)
    // ----------------------------------------------------------------
    defineField({
      name: 'momentSection',
      title: 'Séjours du moment',
      type: 'object',
      group: 'momentSection',
      fields: [
        defineField({ name: 'eyebrow', title: 'Sur-titre (ex. Coups de cœur)', type: 'string' }),
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({ name: 'moreText', title: 'Texte du lien (ex. Voir tous les voyages)', type: 'string' }),
        defineField({ name: 'moreLink', title: 'Lien (commence par /)', type: 'string' }),
        defineField({
          name: 'feature',
          title: 'Voyage principal (grande carte)',
          type: 'object',
          fields: [
            defineField({ name: 'voyage', title: 'Voyage lié (pour le lien)', type: 'reference', to: [{ type: 'voyage' }] }),
            defineField({ name: 'image', title: 'Image de fond', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'pill', title: 'Badge (ex. Le voyage signature)', type: 'string' }),
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'duration', title: 'Durée (ex. 15 jours)', type: 'string' }),
            defineField({ name: 'maxTravelers', title: 'Groupe (ex. 8 max)', type: 'string' }),
            defineField({ name: 'price', title: 'Prix (ex. dès 2 690 €)', type: 'string' }),
            defineField({ name: 'link', title: 'Lien manuel (sinon utilise le voyage lié)', type: 'string' }),
          ],
        }),
        defineField({
          name: 'miniFeatures',
          title: 'Petites cartes (max 2)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'voyage', title: 'Voyage lié (pour le lien)', type: 'reference', to: [{ type: 'voyage' }] }),
                defineField({ name: 'image', title: 'Image de fond', type: 'image', options: { hotspot: true } }),
                defineField({ name: 'title', title: 'Titre', type: 'string' }),
                defineField({ name: 'duration', title: 'Durée (ex. 12 jours)', type: 'string' }),
                defineField({ name: 'maxTravelers', title: 'Groupe (ex. 10 max)', type: 'string' }),
                defineField({ name: 'price', title: 'Prix (ex. dès 3 490 €)', type: 'string' }),
                defineField({ name: 'link', title: 'Lien manuel (sinon utilise le voyage lié)', type: 'string' }),
              ],
              preview: { select: { title: 'title', subtitle: 'price' } },
            },
          ],
          validation: (rule) => rule.max(2),
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 4. Concept / Manifeste
    // ----------------------------------------------------------------
    defineField({
      name: 'concept',
      title: 'Concept / manifeste',
      type: 'object',
      group: 'concept',
      fields: [
        defineField({ name: 'eyebrow', title: 'Sur-titre (ex. Notre concept)', type: 'string' }),
        defineField({ name: 'lead', title: 'Texte principal', type: 'text', rows: 4 }),
        defineField({
          name: 'stats',
          title: 'Statistiques (4 recommandées)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'num', title: 'Chiffre (ex. 8, 90%, 4,9/5)', type: 'string' }),
                defineField({ name: 'label', title: 'Libellé', type: 'string' }),
              ],
              preview: { select: { title: 'num', subtitle: 'label' } },
            },
          ],
          validation: (rule) => rule.max(4),
        }),
        defineField({
          name: 'ctaButton',
          title: 'Bouton CTA',
          type: 'object',
          fields: [
            defineField({ name: 'text', title: 'Texte du bouton', type: 'string' }),
            defineField({ name: 'link', title: 'Lien du bouton', type: 'string' }),
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 5. Guaranteed Departures Section
    // ----------------------------------------------------------------
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
          name: 'eyebrow',
          title: 'Sur-titre (petit texte au-dessus du titre)',
          type: 'string',
        }),
        defineField({
          name: 'voyagesGuaranteedDepartures',
          title: 'Liste des voyages garantis',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
        defineField({
          name: 'ctaButton',
          title: 'Bouton CTA sur la section',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte du bouton',
              type: 'string',
            }),
            defineField({
              name: 'link',
              title: 'Lien du bouton (commence par /)',
              type: 'string',
            }),
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 6. Last Minute (dernières places)
    // ----------------------------------------------------------------
    defineField({
      name: 'lastMinute',
      title: 'Dernières places',
      type: 'object',
      group: 'lastMinute',
      fields: [
        defineField({ name: 'eyebrow', title: 'Sur-titre (petit texte au-dessus du titre)', type: 'string' }),
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Sous-titre', type: 'string' }),
        defineField({
          name: 'voyages',
          title: 'Voyages (peut réutiliser ceux des autres carousels)',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 7. Follow Your Desires Section
    // ----------------------------------------------------------------
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
          name: 'eyebrow',
          title: 'Sur-titre (petit texte au-dessus du titre)',
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

    // ----------------------------------------------------------------
    // 8. Best Sellers
    // ----------------------------------------------------------------
    defineField({
      name: 'bestSellers',
      title: 'Best-sellers',
      type: 'object',
      group: 'bestSellers',
      fields: [
        defineField({ name: 'eyebrow', title: 'Sur-titre (ex. Les plus demandés)', type: 'string' }),
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({
          name: 'items',
          title: 'Voyages / destinations / régions à l\'honneur',
          description: 'Cartes portrait : image + titre + nombre de voyageurs partis. Pour chaque élément, choisissez soit un voyage, soit une destination, soit une région.',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'bestSellerItem',
              title: 'Élément',
              fields: [
                defineField({
                  name: 'voyage',
                  title: 'Voyage',
                  type: 'reference',
                  to: [{ type: 'voyage' }],
                  description: 'Choisissez ceci OU une destination ci-dessous, pas les deux.',
                }),
                defineField({
                  name: 'destination',
                  title: 'Destination',
                  type: 'reference',
                  to: [{ type: 'destination' }],
                  description: 'Choisissez ceci OU un voyage / une région, pas les autres.',
                }),
                defineField({
                  name: 'region',
                  title: 'Région',
                  type: 'reference',
                  to: [{ type: 'region' }],
                  description: 'Choisissez ceci OU un voyage / une destination, pas les autres.',
                }),
                defineField({
                  name: 'travelersCountOverride',
                  title: 'Nombre de voyageurs partis (personnalisé)',
                  type: 'number',
                  description: 'Remplace le calcul automatique (basé sur les réservations). Laisser vide pour garder le calcul automatique.',
                  validation: (rule) => rule.integer().min(0),
                }),
              ],
              validation: (rule) => rule.custom((value: any) => {
                const chosen = [value?.voyage, value?.destination, value?.region].filter(Boolean).length
                if (chosen === 0) return 'Choisissez un voyage, une destination ou une région'
                if (chosen > 1) return 'Choisissez uniquement un voyage OU une destination OU une région, pas plusieurs'
                return true
              }),
              preview: {
                select: {
                  voyageTitle: 'voyage.title',
                  voyageImage: 'voyage.imageCard',
                  voyageImageFallback: 'voyage.image',
                  destinationTitle: 'destination.title',
                  destinationImage: 'destination.image',
                  regionTitle: 'region.nom',
                  regionImage: 'region.image',
                  override: 'travelersCountOverride',
                },
                prepare({voyageTitle, voyageImage, voyageImageFallback, destinationTitle, destinationImage, regionTitle, regionImage, override}: any) {
                  const kind = voyageTitle ? 'Voyage' : destinationTitle ? 'Destination' : regionTitle ? 'Région' : null
                  const subtitleParts = [kind, override != null ? `${override} voyageurs (custom)` : null].filter(Boolean)
                  return {
                    title: voyageTitle || destinationTitle || regionTitle || 'Élément non configuré',
                    subtitle: subtitleParts.join(' • ') || 'Choisir un voyage, une destination ou une région',
                    media: voyageImage || voyageImageFallback || destinationImage || regionImage,
                  }
                },
              },
            },
          ],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // 9. France Trips Section
    // ----------------------------------------------------------------
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
          name: 'eyebrow',
          title: 'Sur-titre (petit texte au-dessus du titre)',
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

    // ----------------------------------------------------------------
    // 10. Contact Section
    // ----------------------------------------------------------------
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

    // ----------------------------------------------------------------
    // 11. Reviews Section
    // ----------------------------------------------------------------
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
          name: 'eyebrow',
          title: 'Sur-titre (petit texte au-dessus du titre)',
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

    // ----------------------------------------------------------------
    // 12. Newsletter Section
    // ----------------------------------------------------------------
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

    // ----------------------------------------------------------------
    // 13. SEO Text Block (bas de page)
    // ----------------------------------------------------------------
    defineField({
      name: 'seoText',
      title: 'Texte SEO (bas de page)',
      type: 'object',
      group: 'seoText',
      fields: [
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({
          name: 'content',
          title: 'Contenu',
          type: 'array',
          of: [richTextBlock],
        }),
      ],
    }),

    // ----------------------------------------------------------------
    // SEO Settings
    // ----------------------------------------------------------------
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
      description: 'Configuration SEO pour la page d\'accueil (og:type = "website", structuredData = "Organization")',
    }),

    // ================================================================
    // Sections obsolètes / non affichées sur la page d'accueil.
    // Conservées (masquées) pour ne pas perdre les données existantes.
    // ================================================================

    // LEGACY # Experience Carousel — non affiché
    defineField({
      name: 'experienceCarousel',
      title: "Carousel d'Expériences",
      type: 'object',
      group: 'legacy',
      hidden: true,
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

    // LEGACY # Travel Differently — non affiché
    defineField({
      name: 'travelDifferently',
      title: 'Voyager, autrement',
      type: 'object',
      group: 'legacy',
      hidden: true,
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

    // LEGACY # Summer Travel — fetché en GROQ mais non affiché sur la page
    defineField({
      name: 'summerTravel',
      title: 'Voyager cet été',
      type: 'object',
      group: 'legacy',
      hidden: true,
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          hidden: true,
        }),
        defineField({
          name: 'voyagesSummerTravel',
          title: 'Liste des voyages',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'voyage' }] }],
        }),
      ],
    }),

    // LEGACY # Unforgettable Travels — non affiché
    defineField({
      name: 'unforgettableTravels',
      title: 'Voyages Inoubliables',
      type: 'object',
      group: 'legacy',
      hidden: true,
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
  ],
})
