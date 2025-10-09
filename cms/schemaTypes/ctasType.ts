import {defineField, defineType} from 'sanity'

export const ctasType = defineType({
  name: 'ctas',
  title: 'CTAs',
  type: 'document',
  groups: [
    {name: 'faq_section', title: 'Section FAQ'},
    {name: 'partenaires_section', title: 'Section Partenaires'},
    {name: 'section_infos', title: 'Section Infos'},
  ],
  preview: {
    prepare() {
      return {
        title: 'CTAs',
        subtitle: 'Call-to-action textes'
      }
    }
  },
  fields: [
    // FAQ Section
    defineField({
      name: 'faqSection',
      title: 'Section FAQ',
      type: 'object',
      group: 'faq_section',
      fields: [
        defineField({
          name: 'ctaCard',
          title: 'CTA Card',
          type: 'object',
          fields: [
            defineField({
              name: 'avatar',
              title: 'Avatar en haut de la card',
              type: 'image',
              options: {hotspot: true}
            }),
            defineField({
              name: 'title',
              title: 'Titre de la card',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'subtitle',
              title: 'Sous-titre de la card',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'button',
              title: 'Bouton de la card',
              type: 'object',
              fields: [
                defineField({
                  name: 'text',
                  title: 'Texte du bouton',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'to',
                  title: 'Lien du bouton',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            })
          ]
        }),
        defineField({
          name: 'faqHomeSubText',
          title: 'Card FAQ',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Texte de la section',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'text',
              title: 'Texte de la section',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'linkOnText',
              title: 'Lien du bouton',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'subtitle',
              title: 'Sous-titre de la section',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'text2',
              title: 'Texte de la section',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'linkOnText2',
              title: 'Lien du bouton',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        })
      ]
    }),

    // Partenaires Section
    defineField({
      name: 'partenairesSection',
      title: 'Section partenaires',
      type: 'object',
      group: 'partenaires_section',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre de la section',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre de la section',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Layout Info Container
    defineField({
      name: 'layoutInfoContainer',
      title: 'Section Infos: Utilisée dans les layouts',
      type: 'object',
      group: 'section_infos',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre de la section Infos dans les layouts',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre de la section Infos dans les layouts',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
