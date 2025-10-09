import {defineField, defineType} from 'sanity'

export const chequesVacancesType = defineType({
  name: 'chequesVacances',
  title: 'Chèques-Vacances',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Chèques-Vacances',
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
      name: 'heroImage',
      type: 'image',
      title: 'Image Hero',
      options: {hotspot: true},
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Contenu',
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
    defineField({
      name: 'ctaButton',
      type: 'object',
      title: 'Bouton CTA',
      fields: [
        defineField({
          name: 'text',
          type: 'string',
          title: 'Texte du bouton',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'link',
          type: 'url',
          title: 'Lien',
          validation: (rule) => rule.uri({
            scheme: ['http', 'https']
          }),
        }),
      ],
    }),
  ],
})
