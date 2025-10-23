import {defineField, defineType} from 'sanity'

export const offreCadeauType = defineType({
  name: 'offreCadeau',
  title: 'Offre Cadeau',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Offre Cadeau',
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
      title: 'Image Hero Desktop',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'heroImageMobile',
      type: 'image',
      title: 'Image Hero Mobile',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'mainContent',
      type: 'array',
      title: 'Contenu principal',
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
            {title: 'Quote', value: 'blockquote'},
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
                    validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto']}),
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'howItWorksTitle',
      type: 'string',
      title: 'Titre "Comment ça marche ?"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Configuration SEO pour la page offre cadeau',
    }),
    defineField({
      name: 'pictoCols',
      type: 'array',
      title: 'Colonnes avec pictogrammes',
      of: [
        defineField({
          name: 'pictoCol',
          type: 'object',
          title: 'Colonne avec pictogramme',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'text',
              type: 'string',
              title: 'Texte',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'text',
              media: 'image',
            },
          },
        }),
      ],
    }),
  ],
})
