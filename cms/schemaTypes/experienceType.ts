import {defineField, defineType} from 'sanity'

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'badgeTitle', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'discoveryTitle', type: 'string'}),
    defineField({name: 'seoTitle', type: 'string'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'} as any],
    }),
    defineField({name: 'showOnHome', type: 'boolean', initialValue: false}),
    defineField({
      name: 'blog',
      type: 'reference',
      to: [{type: 'blog'}],
      title: 'Blog Post',
      description: 'Blog post associé à cette expérience',
    }),
  ],
})

