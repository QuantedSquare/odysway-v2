// ./schemas/heroType.ts

import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const heroType = defineType({
  name: 'hero',
  type: 'object',
  title: 'Hero',
  fields: [
    // LEGACY #
    defineField({
      name: 'heading',
      type: 'string',
      hidden: true,
    }),
    // LEGACY #
    defineField({
      name: 'tagline',
      type: 'string',
      hidden: true,
    }),
    // LEGACY #
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      hidden: true,
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
  ],
  icon: DocumentTextIcon,
  preview: {
    select: {
      title: 'heading',
      image: 'image',
    },
    prepare({title, image}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Hero',
        media: image || DocumentTextIcon,
      }
    },
  },
})