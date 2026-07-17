// ./schemas/videoType.js

import {DocumentVideoIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const videoType = defineType({
  name: 'video',
  type: 'object',
  fields: [
    // LEGACY #
    defineField({
      name: 'videoLabel',
      type: 'string',
      hidden: true,
    }),
    // LEGACY #
    defineField({
      name: 'url',
      type: 'string',
      title: 'URL',
      hidden: true,
    }),
  ],
  icon: DocumentVideoIcon,
  preview: {
    select: {
      title: 'videoLabel',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Video',
        media: DocumentVideoIcon,
      }
    },
  },
})