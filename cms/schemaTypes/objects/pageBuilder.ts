// ./schemas/pageType.ts

import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const blockContent = defineField({
  name: 'blockContent',
  type: 'array',
  of: [
    {type: 'block'},
  ],
})


export const pageType = defineType({
  name: 'pageBuilder',
  type: 'object',
  title: 'Page',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'slug',
      type: 'slug',
      validation: (r) => r.required(),
      title: 'Slug de la page',
    }),
    defineField({
      name: 'blocks',
      type: 'array',
      title: 'Page builder',
      options: {
        layout: 'list',
        insertMenu: {
          filter: true,
          groups: [
            {
              name: 'landing',
              title: 'Landing Page',
              of: ['hero', 'promotion', 'form'],
            },
            {
              name: 'promotions',
              title: 'Promotions',
              of: ['gallery', 'video', 'promotion'],
            },
            {
              name: 'blackFriday',
              title: 'Black Friday',
              of: ['textWithIllustration', 'gallery', 'video'],
            }
          ],
          views: [
            {name: 'list'},
            {name: 'grid', 
              previewImageUrl: (schemaTypeName) => `/static/preview-${schemaTypeName}.jpg`
            }
          ]
        }
      },
      of: [
        defineArrayMember({
          name: 'hero',
          type: 'hero',
        }),
        defineArrayMember({
          name: 'blockContent',
          type: 'blockContent',
        }),
        defineArrayMember({
          name: 'gallery',
          type: 'gallery',
        }),
        defineArrayMember({
          name: 'form',
          type: 'form',
        }),
        defineArrayMember({
          name: 'video',
          type: 'video',
        }),
        defineArrayMember({
          name: 'callToAction',
          type: 'reference',
          to: [{type: 'promotion'}],
        }),
        // etc...
      ],
    }),
  ],
  icon: DocumentIcon,
})