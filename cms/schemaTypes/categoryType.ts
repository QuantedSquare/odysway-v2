import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discoveryTitle',
      type: 'string',
      description: 'Titre pour la page de découverte',
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string'} as any,
      ],
    }),
    defineField({
      name: 'showOnHome',
      type: 'boolean',
    }),
  ],
  // preview: {
  //   select: {
  //     title: 'title',
  //     subtitle: 'slug.current',
  //   },
  // },
})

