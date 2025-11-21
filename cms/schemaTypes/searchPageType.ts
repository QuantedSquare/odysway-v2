import {defineField, defineType} from 'sanity'

export const searchPageType = defineType({
  name: 'search',
  title: 'Page Recherche',
  type: 'document',
  groups: [
    {name: 'search_form', title: 'Formulaire de Recherche'},
    {name: 'search_dialog', title: 'Dialogue de Recherche'},
    {name: 'search_results', title: 'Résultats de Recherche'},
    {name: 'search_hero', title: 'Section Hero'},
    {name: 'info_container', title: 'Container d\'Information'},
    {name: 'seo', title: 'SEO'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Page Recherche',
        subtitle: 'Textes pour la recherche et les résultats'
      }
    }
  },
  fields: [
    // Search Form Fields
    defineField({
      name: 'destination',
      title: 'Label Destination',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'travelType',
      title: 'Label Type de voyage',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'period',
      title: 'Label Période',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'discoverTrips',
      title: 'Texte bouton découvrir les voyages',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'topDestinations',
      title: 'Texte top destinations',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'allPeriods',
      title: 'Texte toutes périodes',
      type: 'string',
      group: 'search_form',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'travelTypes',
      title: 'Types de voyage',
      type: 'object',
      group: 'search_form',
      fields: [
        defineField({
          name: 'individual',
          title: 'Voyage individuel',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'group',
          title: 'Voyage en petits groupes',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Search Dialog Fields
    defineField({
      name: 'searchDialogTitle',
      title: 'Titre du dialogue de recherche',
      type: 'string',
      group: 'search_dialog',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'searchDialogPlaceholder',
      title: 'Texte dans la barre de recherche',
      type: 'string',
      group: 'search_dialog',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'searchDialogBtnList',
      title: 'Liste de boutons dans le dialogue de recherche',
      type: 'array',
      group: 'search_dialog',
      of: [{type: 'object', fields: [
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
          title: 'Texte du bouton',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'link',
          title: 'URL du bouton',
          description: 'Seuls les chemins de site Odysway sont acceptés (ex : "/destinations/cap-vert").',
          type: 'string',
          validation: Rule => Rule.required().custom((value) => {
            if (!value) return true
            try {
              // Accept if it's already a path (starts with '/')
              if (typeof value === 'string' && value.startsWith('/')) return true

              // Try to parse as a URL, and accept if the path is non-empty and matches input
              const url = new URL(value)
              if (url.pathname && url.hostname === 'odysway.com') {
                // Suggest stripping to path if user gives absolute URL
                return `Veuillez entrer seulement le chemin (ex : "${url.pathname}") sans "https://odysway.com".`
              }
              // If not odysway.com, reject
              return 'Seuls les chemins de site Odysway sont acceptés (ex : "/destinations/cap-vert").'
            } catch (e) {
              // Not a valid URL, accept if it looks like a path
              if (typeof value === 'string' && value.startsWith('/')) return true
              return 'Veuillez saisir un chemin commençant par "/" (ex : "/destinations/cap-vert").'
            }
          })
        }),
      ]}]
    }),

    // Search Results Fields
    defineField({
      name: 'oneTrip',
      title: 'Texte pour un voyage',
      type: 'string',
      group: 'search_results',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'multipleTrips',
      title: 'Texte pour plusieurs voyages',
      type: 'string',
      group: 'search_results',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'resetButton',
      title: 'Texte bouton réinitialiser',
      type: 'string',
      group: 'search_results',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title:'Image dans le Hero',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'} as any],
    }),
    // Search Hero Section
    defineField({
      name: 'searchHero',
      title: 'Section Hero de Recherche',
      type: 'object',
      group: 'search_hero',
      fields: [
        defineField({
          name: 'voyagePrefix',
          title: 'Préfixe "Nos voyages"',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'defaultTitle',
          title: 'Titre par défaut',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Info Container
    defineField({
      name: 'infoContainer',
      title: 'Container d\'Information',
      type: 'object',
      group: 'info_container',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'buttonText',
          title: 'Texte du bouton',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Configuration SEO pour le voyage',
      group: 'seo',
    }),
  ]
})
