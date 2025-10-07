import {defineField, defineType} from 'sanity'

export const pageBlogType = defineType({
  name: 'page_blog',
  title: 'Page Blog',
  type: 'document',
  preview: {
    select: {
      title: 'pageTitle'
    },
    prepare(selection) {
      const {title} = selection
      return {
        title: title || 'Page Blog',
        subtitle: 'Textes pour la page blog'
      }
    }
  },
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Titre de la page blog',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Placeholder du champ de recherche',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'categoryFilter',
      title: 'Label du filtre par catégorie',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'sortByDate',
      title: 'Label du tri par date',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'noArticlesFound',
      title: 'Message quand aucun article trouvé',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'resetFilters',
      title: 'Texte du bouton réinitialiser les filtres',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'sortOptions',
      title: 'Options de tri',
      type: 'object',
      fields: [
        defineField({
          name: 'newest',
          title: 'Option tri plus récent',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'oldest',
          title: 'Option tri plus ancien',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'shortest',
          title: 'Option tri plus court',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'longest',
          title: 'Option tri plus long',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
