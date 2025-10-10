import {defineField, defineType} from 'sanity'

export const destinationType = defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'chapka', type: 'string'}),
    defineField({name: 'iso', type: 'string'}),
    defineField({name: 'interjection', type: 'string'}),
    defineField({name: 'metaDescription', type: 'text'}),
    defineField({name: 'showOnHome', type: 'boolean', initialValue: false}),
    defineField({
      name: 'regions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'region'}]}],
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string'} as any,
      ],
    }),
    defineField({name: 'isTopDestination', type: 'boolean', initialValue: false}),
    defineField({
      name: 'blog',
      type: 'reference',
      title: 'Blog Post',
      description: 'The blog post associated with this destination',
      to: [{type: 'blog'}],
    }),
  ],
})

