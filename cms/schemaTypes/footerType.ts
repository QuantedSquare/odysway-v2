import {defineField, defineType} from 'sanity'

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  preview: {
    prepare() {
      return {
        title:  'Footer Configuration',
      }
    }
  },
  groups: [
    {name: 'main', title: 'Main'},
    {name: 'contact', title: 'Contact information'},
    {name: 'social', title: 'Social media'},
    {name: 'linksList', title: 'Links List'},
  ],
  fields: [
    defineField({
      name: 'logo',
      title: 'Section Logo et description',
      type: 'object',
      group: 'main',
      fields: [
        defineField({
          name: 'image',
          title: 'Logo Odysway',
          type: 'image',
          options: {hotspot: true}
        }),
        defineField({
          name: 'description',
          title: 'Description de Odysway placé sous le Logo',
          type: 'text'
        })
      ]
    }),
    defineField({
      name: 'team',
      title: 'Team Section',
      type: 'object',
      group: 'main',
      fields: [
        defineField({
          name: 'image',
          title: 'Photo de groupe de l\'équipe',
          type: 'image',
          options: {hotspot: true}
        })
      ]
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({
          name: 'ctaText',
          title: 'Texte au dessus des informations de contact',
          type: 'string'
        }),
        defineField({
          name: 'phone',
          title: 'Phone of Odysway',
          type: 'string'
        }),
        defineField({
          name: 'email',
          title: 'Email of Odysway',
          type: 'string'
        }),
        defineField({
          name: 'buttonContact',
          title: 'Bouton de contact',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte du bouton',
              type: 'string'
            }),
            defineField({
              name: 'lien',
              title: 'URL de redirection au click du bouton',
              type: 'string'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'social',
      title: 'Social Media Links',
      type: 'object',
      group: 'social',
          fields: [
            defineField({
              name: 'facebook',
              title: 'Lien Facebook',
              type: 'url',
              validation: Rule => Rule.uri({
                scheme: ['https']
              })
            }),
            defineField({
              name: 'instagram',
              title: 'Lien Instagram',
              type: 'url',
              validation: Rule => Rule.uri({
                scheme: ['https']
              })
            }),
            defineField({
              name: 'tiktok',
              title: 'Lien TikTok',
              type: 'url',
              validation: Rule => Rule.uri({
                scheme: ['https']
              })
            })
          ]
    }),
    defineField({
      name: 'linksList',
      title: 'Links List',
      type: 'object',
      group: 'linksList',
      fields: [
        defineField({
          name: 'colonne1',
          title: 'Colonne 1',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre de la colonne',
              type: 'string'
            }),
            defineField({
              name: 'links',
              title: 'Liens de la colonne 1',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Texte du lien',
                      type: 'string'
                    }),
                    defineField({
                      name: 'to',
                      title: 'URL de redirection',
                      type: 'string'
                    })
                  ]
                }
              ]
            })
          ]
        }),
        defineField({
          name: 'colonne2',
          title: 'Colonne 2',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre de la colonne',
              type: 'string'
            }),
            defineField({
              name: 'links',
              title: 'Liens de la colonne 2',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Texte du lien',
                      type: 'string'
                    }),
                    defineField({
                      name: 'to',
                      title: 'URL de redirection',
                      type: 'string'
                    })
                  ]
                }
              ]
            })
          ]
        }),
        defineField({
          name: 'colonne3',
          title: 'Colonne 3',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre de la colonne',
              type: 'string'
            }),
            defineField({
              name: 'links',
              title: 'Liens de la colonne 3',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Texte du lien',
                      type: 'string'
                    }),
                    defineField({
                      name: 'to',
                      title: 'URL de redirection',
                      type: 'string'
                    })
                  ]
                }
              ]
            })
          ]
        }),
        defineField({
          name: 'colonne4',
          title: 'Où nous trouver',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre de la colonne',
              type: 'string'
            }),
            defineField({
              name: 'name',
              title: 'Nom de la société',
              type: 'string'
            }),
            defineField({
              name: 'address',
              title: 'Numéro de rue, rue',
              type: 'string'
            }),
            defineField({
              name: 'city',
              title: 'Ville, code postal, pays',
              type: 'string'
            })
          ]
        })
      ]
    })
  ]
})
