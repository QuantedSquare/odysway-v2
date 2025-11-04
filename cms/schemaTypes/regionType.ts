import {defineField, defineType} from 'sanity'

export const regionType = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  groups: [
    {name: 'basic', title: 'Informations de Base'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'nom', type: 'string', validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'meta_description', type: 'text', group: 'basic'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'nom'}, validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'interjection', type: 'string', group: 'basic'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'} as any],
      group: 'basic',
    }),
    defineField({
      name: 'blog',
      type: 'reference',
      to: [{type: 'blog'}],
      title: 'Blog Post',
      description: 'Blog post associé à cette région',
      group: 'basic',
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
})

