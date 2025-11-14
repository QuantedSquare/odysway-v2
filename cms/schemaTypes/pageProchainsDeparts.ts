import {defineField, defineType} from 'sanity'

export const pageProchainsDeparts = defineType({
  name: 'page_prochains_departs',
  title: 'Page Prochains Départs',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Page Prochains départ',
        subtitle: 'Textes et Seo pour la page des prochains départs'
      }
    }
  },
  fields: [
    // Index page
    defineField({
      name: 'index',
      title: 'Page Index des Prochains Départs (odysway.com/prochains-departs)',
      type: 'object',
      fields: [
        defineField({
          name: 'pageTitle',
          title: 'Titre de la page',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'metaDescription',
          title: 'Description',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'image',
      title:'Image dans le Hero',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'} as any],
    }),
    defineField({
      name: 'heroText',
      title: 'Texte dans le hero',
      type: 'string',
    }),
    // Slug page
    
        defineField({
          name: 'allTravelsButton',
          title: 'Texte bouton pour tous les voyages',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'frenchTravelsButton',
          title: 'Texte bouton pour tous les voyages en France',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'foreignTravelsButton',
          title: 'Texte bouton pour tous les voyages à l\'étranger',
          type: 'string',
          validation: Rule => Rule.required()
        }),
      
    defineField({
      name: 'common',
      title: 'Éléments Communs',
      type: 'object',
      fields: [
        defineField({
          name: 'expandButton',
          title: 'Bouton d\'expansion',
          type: 'object',
          fields: [
            defineField({
              name: 'showMore',
              title: 'Texte "Voir plus"',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'showLess',
              title: 'Texte "Voir moins"',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Configuration SEO pour la page prochains départs',
    }),

  ]
})
