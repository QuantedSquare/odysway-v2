import {defineField, defineType} from 'sanity'

export const blogCategoryType = defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alt Text'} as any],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
})
