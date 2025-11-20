import {defineField, defineType} from 'sanity'

export const destinationType = defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  groups: [
    {name: 'basic', title: 'Informations de Base'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required(), group: 'basic'}),
    defineField({name: 'chapka', type: 'string', group: 'basic'}),
    defineField({name: 'iso', type: 'string', group: 'basic'}),
    defineField({name: 'interjection', type: 'string', group: 'basic'}),
    defineField({name: 'metaDescription', type: 'text', title: 'Description', group: 'basic'}),
    defineField({name: 'showOnHome', type: 'boolean', initialValue: false, group: 'basic', hidden: true}),
    defineField({
      name: 'regions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'region'}]}],
      group: 'basic',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string'} as any,
      ],
      group: 'basic',
    }),
    defineField({name: 'isTopDestination', type: 'boolean', initialValue: false, description: 'Afficher cette destination dans les tops de la barre de recherche', group: 'basic'}),
    defineField({
      name: 'blog',
      type: 'reference',
      title: 'Blog Post',
      description: 'The blog post associated with this destination',
      to: [{type: 'blog'}],
      group: 'basic',
      }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
})

