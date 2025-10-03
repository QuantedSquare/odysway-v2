import {defineField, defineType} from 'sanity'

export const regionType = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  fields: [
    defineField({name: 'nom', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'meta_description', type: 'text'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'nom'}, validation: (r) => r.required()}),
    defineField({name: 'interjection', type: 'string'}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}, fields: [
      {name: 'alt', type: 'string'} as any,
    ]}),
  ],
})

