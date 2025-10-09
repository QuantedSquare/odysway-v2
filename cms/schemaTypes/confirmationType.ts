import {defineField, defineType} from 'sanity'

export const confirmationType = defineType({
  name: 'confirmation',
  title: 'Confirmation',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Page de confirmation',
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
      title: 'Titre',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      title: 'Slug',
    }),
    defineField({
      name: 'titleOption',
      type: 'string',
      title: 'Titre Option',
      description: 'Titre affiché quand une option est prise',
    }),
    defineField({
      name: 'titleDefault',
      type: 'string',
      title: 'Titre par défaut',
      description: 'Titre affiché par défaut',
    }),
    defineField({
      name: 'titleError',
      type: 'string',
      title: 'Titre d\'erreur',
      description: 'Titre affiché en cas d\'erreur',
    }),
    defineField({
      name: 'errorMessage',
      type: 'text',
      title: 'Message d\'erreur',
      description: 'Message affiché en cas d\'erreur',
    }),
    defineField({
      name: 'accrocheOption',
      type: 'text',
      title: 'Accroche Option',
      description: 'Message pour les options réservées',
    }),
    defineField({
      name: 'accrocheDefault',
      type: 'text',
      title: 'Accroche par défaut',
      description: 'Message par défaut de confirmation',
    }),
    defineField({
      name: 'accrocheDevis',
      type: 'text',
      title: 'Accroche Devis',
      description: 'Message pour les demandes de devis',
    }),
  ],
})
