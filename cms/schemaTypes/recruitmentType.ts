import {defineField, defineType} from 'sanity'

export const recruitmentType = defineType({
  name: 'recruitment',
  title: 'Recruitment',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Page de recrutement',
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
      name: 'jobOffers',
      type: 'array',
      title: 'Offres d\'emploi',
      of: [
        {
          type: 'object',
          name: 'jobOffer',
          title: 'Offre d\'emploi',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Titre du poste',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'location',
              type: 'string',
              title: 'Localisation',
            }),
            defineField({
              name: 'description',
              type: 'text',
              title: 'Description',
            }),
            defineField({
              name: 'applicationLink',
              type: 'url',
              title: 'Lien de candidature',
              validation: (rule) => rule.uri({
                scheme: ['http', 'https']
              }),
            }),
            defineField({
              name: 'ctaText',
              type: 'string',
              title: 'Texte du bouton',
              initialValue: 'Postuler',
            }),
          ],
        },
      ],
    }),
  ],
})
