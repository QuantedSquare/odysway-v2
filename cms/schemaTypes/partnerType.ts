import {defineField, defineType} from 'sanity'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  hidden: true,
  fields: [
    defineField({name: 'img', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'description', type: 'string'}),
    defineField({name: 'isOnHome', type: 'boolean'}),
    defineField({name: 'whiteFilter', type: 'boolean'}),
  ],
})

