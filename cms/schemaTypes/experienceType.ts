import {defineField, defineType} from 'sanity'

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  groups: [
    {name: 'basic', title: 'Informations de Base'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'badgeTitle', type: 'string', validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'description', type: 'text', group: 'basic'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'} as any],
      group: 'basic',
    }),
    defineField({name: 'showOnHome', type: 'boolean', initialValue: false, group: 'basic'}),
    defineField({
      name: 'blog',
      type: 'reference',
      to: [{type: 'blog'}],
      title: 'Blog Post',
      description: 'Blog post associé à cette expérience',
      group: 'basic',
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
})

