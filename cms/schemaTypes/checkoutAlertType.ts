import { defineField, defineType } from 'sanity'

export const checkoutAlertType = defineType({
  name: 'checkoutAlert',
  title: 'Checkout - Alertes',
  type: 'document',
  preview: {
    select: {
      title: 'title',
      key: 'key',
    },
    prepare({ title, key }) {
      return {
        title: title || 'Alerte checkout',
        subtitle: key ? `key: ${key}` : '',
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'CTA principal - Label',
      type: 'string',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'CTA principal - Lien',
      type: 'string',
      description: 'Chemin interne (ex: /voyages/mongolie) ou URL complète.',
    }),
  ],
})

