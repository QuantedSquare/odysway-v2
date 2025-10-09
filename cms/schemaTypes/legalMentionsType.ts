import {defineField, defineType} from 'sanity'

export const legalMentionsType = defineType({
  name: 'legalMentions',
  title: 'Mentions Légales',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Mentions légales',
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
      title: 'Titre',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      title: 'Slug',
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Contenu des mentions légales',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'H5', value: 'h5'},
            {title: 'H6', value: 'h6'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) => rule.uri({
                      scheme: ['http', 'https', 'mailto']
                    })
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  ],
})
