import {defineField, defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'Page FAQ',
  type: 'document',
  preview: {
    select: {
      title: 'title',
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la page',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'backgroundImage',
      title: 'Image de fond',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    // FAQ Items
    defineField({
      name: 'faqItems',
      title: 'Questions et Réponses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'array',
              of: [{
                type: 'block',
                title: 'Bloc de texte',
                styles: [
                  {title: 'Normal', value: 'normal'},
                  {title: 'H2', value: 'h2'},
                  {title: 'H3', value: 'h3'},
                  {title: 'H4', value: 'h4'},
                  {title: 'Citation', value: 'blockquote'},
                ],
                marks: {
                  decorators: [
                    {title: 'Gras', value: 'strong'},
                    {title: 'Italique', value: 'em'},
                    {title: 'Souligné', value: 'underline'},
                    {title: 'Barré', value: 'strike-through'},
                  ],
                  annotations: [
                    {
                      name: 'link',
                      type: 'object',
                      title: 'Lien',
                      fields: [
                        {
                          name: 'href',
                          type: 'url',
                          title: 'URL',
                          validation: (rule: any) => rule.uri({
                            scheme: ['http', 'https', 'mailto']
                          })
                        },
                      ],
                    },
                  ],
                },
                lists: [
                  {title: 'Puces', value: 'bullet'},
                  {title: 'Numéroté', value: 'number'},
                ],
              }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'hide',
              title: 'Masquer cette question',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'hide',
            },
            prepare(selection) {
              const {title, subtitle} = selection
              return {
                title: title,
                subtitle: subtitle ? 'Masquée' : 'Visible',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Configuration SEO pour la page FAQ',
    }),
  ],
})
