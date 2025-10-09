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
      title: 'Page Index des Expériences',
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
          title: 'Description meta',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Slug page
    defineField({
      name: 'slug',
      title: 'Page Slug d\'une Expérience',
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
    })
  ]
})
