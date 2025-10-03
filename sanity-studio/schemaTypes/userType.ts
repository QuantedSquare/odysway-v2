import {defineField, defineType} from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'username',
      type: 'string',
      description: 'Unique handle for the user',
      validation: (rule) => rule.required().regex(/^[a-z0-9_\-]+$/i, {
        name: 'alphanumeric',
        invert: false,
      }),
    }),
    defineField({
      name: 'email',
      type: 'email',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'username',
      media: 'avatar',
    },
  },
})

