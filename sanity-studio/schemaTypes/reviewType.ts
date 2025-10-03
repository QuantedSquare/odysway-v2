import {defineField, defineType} from 'sanity'

export const reviewType = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({name: 'author', type: 'string'}),
    defineField({name: 'authorAge', type: 'string'}),
    defineField({name: 'date', type: 'date'}),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'rating', type: 'number'}),
    defineField({name: 'text', type: 'text'}),
    defineField({
      name: 'voyage',
      title: 'Voyage',
      type: 'reference',
      to: [{type: 'voyage'}],
    }),
    defineField({name: 'voyageTitle', type: 'string'}),
    defineField({name: 'isOnHome', type: 'boolean'}),
  ],
})

