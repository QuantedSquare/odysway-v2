import {defineField, defineType} from 'sanity'

export const newsletterType = defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Newsletter',
        subtitle: 'Textes pour la newsletter'
      }
    }
  },
  fields: [
    defineField({
      name: 'emailPlaceholder',
      title: 'Placeholder du champ email',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subscribeButton',
      title: 'Texte du bouton d\'inscription',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'successMessage',
      title: 'Message de succès après inscription',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'closeButton',
      title: 'Texte du bouton fermer',
      type: 'string',
      validation: Rule => Rule.required()
    })
  ]
})
