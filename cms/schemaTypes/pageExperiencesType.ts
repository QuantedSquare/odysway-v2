import {defineField, defineType} from 'sanity'

export const pageExperiencesType = defineType({
  name: 'page_experiences',
  title: 'Page Expériences',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Page Expériences',
        subtitle: 'Textes pour la page des expériences'
      }
    }
  },
  fields: [
    // Index page
    defineField({
      name: 'index',
      title: 'Page Index des Expériences (odysway.com/experiences)',
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
      name: 'slug',
      title: 'Placeholder pour la recherche',
      type: 'object',
      fields: [
        defineField({
          name: 'noVoyagesFound',
          title: 'Message quand aucun voyage trouvé',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'modifySearchCriteria',
          title: 'Texte pour modifier les critères de recherche',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Common elements
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
      description: 'Configuration SEO pour la page expériences',
    }),
  ]
})
