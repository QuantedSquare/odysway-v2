import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const topsType = defineType({
  name: 'tops',
  title: 'Tops',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'tops'}),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contenuOnglet',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'linksList',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'slug',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'slug',
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'linksList',
            },
            prepare(selection) {
              const {title, subtitle} = selection
              const linkCount = subtitle ? subtitle.length : 0
              return {
                title: title,
                subtitle: `${linkCount} lien${linkCount > 1 ? 's' : ''}`,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
