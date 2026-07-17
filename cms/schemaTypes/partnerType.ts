import {defineField, defineType} from 'sanity'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  hidden: true,
  fields: [
    // LEGACY #
    defineField({name: 'img', title: 'Image', type: 'image', options: {hotspot: true}, hidden: true}),
    // LEGACY #
    defineField({name: 'description', type: 'string', hidden: true}),
    // LEGACY #
    defineField({name: 'isOnHome', type: 'boolean', hidden: true}),
    // LEGACY #
    defineField({name: 'whiteFilter', type: 'boolean', hidden: true}),
  ],
})

