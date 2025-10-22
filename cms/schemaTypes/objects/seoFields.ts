import {defineField, defineType} from 'sanity'

export const seoFields = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    // Basic SEO
    defineField({
      name: 'metaTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Titre SEO (max 60 caractères). Si vide, le titre de la page sera utilisé.',
      validation: (Rule) => Rule.max(60).warning('Devrait être inférieur à 60 caractères'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Description SEO (max 160 caractères). Utilisée dans les résultats de recherche.',
      validation: (Rule) => Rule.max(160).warning('Devrait être inférieur à 160 caractères'),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'URL Canonique',
      type: 'url',
      description: "L'URL principale de la page (ex: https://odysway.com/voyages/immersion-japon). Laisser vide pour utiliser l'URL par défaut.",
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Mot-clé Principal',
      type: 'string',
      description: 'Mot-clé principal pour cette page/contenu',
    }),
    defineField({
      name: 'keywords',
      title: 'Mots-clés',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Mots-clés additionnels pour ce contenu',
    }),
    defineField({
      name: 'robotsIndex',
      title: 'Autoriser l\'indexation par les moteurs de recherche',
      type: 'boolean',
      initialValue: true,
      description: 'Si décoché, les moteurs de recherche n\'indexeront pas cette page',
    }),
    defineField({
      name: 'robotsFollow',
      title: 'Autoriser le suivi des liens',
      type: 'boolean',
      initialValue: true,
      description: 'Si décoché, les moteurs de recherche ne suivront pas les liens de cette page',
    }),

    // Open Graph (réseaux sociaux)
    defineField({
      name: 'ogTitle',
      title: 'Open Graph Title',
      type: 'string',
      description: 'Titre pour le partage social (Facebook, LinkedIn). Par défaut = SEO Title.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph Description',
      type: 'text',
      rows: 2,
      description: 'Description pour le partage social. Par défaut = SEO Description.',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image de partage social HD (recommandé: 1200x630px). Si vide, l\'image principale sera utilisée.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
          description: 'Ex: "Voyage immersif au Japon avec Odysway"',
        },
      ],
    }),
    defineField({
      name: 'ogType',
      title: 'Open Graph Type',
      type: 'string',
      options: {
        list: [
          {title: 'Website (page d\'accueil)', value: 'website'},
          {title: 'Article (blog/destination)', value: 'article'},
          {title: 'Product (voyage individuel)', value: 'product'},
        ],
      },
      initialValue: 'website',
      description: 'Type de contenu pour le partage social',
    }),

    // Twitter Card
    defineField({
      name: 'twitterCard',
      title: 'Twitter Card Type',
      type: 'string',
      options: {
        list: [
          {title: 'Summary', value: 'summary'},
          {title: 'Summary Large Image', value: 'summary_large_image'},
        ],
      },
      initialValue: 'summary_large_image',
      description: 'Type de carte Twitter',
    }),
    defineField({
      name: 'twitterSite',
      title: 'Compte Twitter',
      type: 'string',
      initialValue: '@odysway',
      description: 'Compte Twitter du site (ex: @odysway)',
    }),
    defineField({
      name: 'twitterTitle',
      title: 'Twitter Title',
      type: 'string',
      description: 'Titre pour Twitter. Par défaut = OG Title.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'twitterDescription',
      title: 'Twitter Description',
      type: 'text',
      rows: 2,
      description: 'Description pour Twitter. Par défaut = OG Description.',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'twitterImage',
      title: 'Twitter Image',
      type: 'image',
      description: 'Image pour Twitter (recommandé: 1200x628px). Par défaut = OG Image.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
        },
      ],
    }),

    // Structured Data (JSON-LD)
    defineField({
      name: 'structuredData',
      title: 'Données Structurées (JSON-LD)',
      type: 'object',
      description: 'Configuration du balisage Schema.org pour les résultats enrichis Google',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'schemaType',
          title: 'Type de Schema',
          type: 'string',
          options: {
            list: [
              {title: 'Product (voyage)', value: 'Product'},
              {title: 'TouristTrip (voyage touristique)', value: 'TouristTrip'},
              {title: 'Article (blog)', value: 'Article'},
              {title: 'FAQPage (page FAQ)', value: 'FAQPage'},
              {title: 'Organization (page accueil)', value: 'Organization'},
            ],
          },
          description: 'Type de balisage Schema.org à utiliser',
        }),
        defineField({
          name: 'productAvailability',
          title: 'Disponibilité (Product)',
          type: 'string',
          options: {
            list: [
              {title: 'En stock', value: 'InStock'},
              {title: 'Rupture de stock', value: 'OutOfStock'},
              {title: 'Pré-commande', value: 'PreOrder'},
              {title: 'Disponible sur commande', value: 'BackOrder'},
            ],
          },
          description: 'Disponibilité du produit/voyage (pour schema Product)',
          hidden: ({parent}) => parent?.schemaType !== 'Product',
        }),
        defineField({
          name: 'brand',
          title: 'Marque',
          type: 'string',
          initialValue: 'Odysway',
          description: 'Nom de la marque (généralement "Odysway")',
        }),
        defineField({
          name: 'includeReviews',
          title: 'Inclure les avis dans le balisage',
          type: 'boolean',
          initialValue: true,
          description: 'Ajouter les avis clients dans le balisage Product',
          hidden: ({parent}) => parent?.schemaType !== 'Product',
        }),
      ],
    }),

    // Advanced
    defineField({
      name: 'noSnippet',
      title: 'No Snippet',
      type: 'boolean',
      description: 'Empêcher les moteurs de recherche d\'afficher un extrait dans les résultats',
      initialValue: false,
    }),
    defineField({
      name: 'noArchive',
      title: 'No Archive',
      type: 'boolean',
      description: 'Empêcher les moteurs de recherche d\'afficher un lien en cache',
      initialValue: false,
    }),
  ],
})

