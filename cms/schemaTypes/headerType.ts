import {defineField, defineType} from 'sanity'

export const headerType = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  preview: {
    prepare() {
      return {
        title:  'Header Configuration',
      }
    }
  },
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'object',
      fields: [
        defineField({
          name: 'desktop',
          title: 'Logo sur grand écran',
          type: 'image',
          options: {hotspot: true}
        }),
        defineField({
          name: 'mobile',
          title: 'Logo sur téléphone',
          type: 'image',
          options: {hotspot: true}
        }),
        defineField({
          name: 'alt',
          title: 'Alt',
          type: 'string'
        }),
        defineField({
          name: 'to',
          title: 'URL de redirection au click du logo',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'search',
      title: 'Search',
      type: 'boolean'
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation (menu mobile)',
      description: 'Liens de navigation affichés dans le menu mobile. Un lien peut contenir des sous-liens (ex. Destinations) : il devient alors un panneau dépliable.',
      type: 'array',
      of: [
        defineField({
          name: 'navItem',
          title: 'Lien',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (r) => r.required()
            }),
            defineField({
              name: 'link',
              title: 'URL de redirection',
              description: 'Laisser vide si ce lien sert uniquement à ouvrir un panneau de sous-liens.',
              type: 'string'
            }),
            defineField({
              name: 'children',
              title: 'Sous-liens (panneau dépliable)',
              type: 'array',
              of: [
                defineField({
                  name: 'childLink',
                  title: 'Sous-lien',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Libellé',
                      type: 'string',
                      validation: (r) => r.required()
                    }),
                    defineField({
                      name: 'link',
                      title: 'URL de redirection',
                      type: 'string',
                      validation: (r) => r.required()
                    }),
                    defineField({
                      name: 'highlight',
                      title: 'Mis en avant',
                      description: 'Affiche le sous-lien en couleur accentuée (ex. « Tous nos voyages »).',
                      type: 'boolean',
                      initialValue: false
                    })
                  ],
                  preview: {
                    select: {title: 'label', subtitle: 'link'}
                  }
                })
              ]
            })
          ],
          preview: {
            select: {title: 'label', subtitle: 'link', children: 'children'},
            prepare({title, subtitle, children}: any) {
              const count = Array.isArray(children) ? children.length : 0
              return {
                title,
                subtitle: count > 0 ? `Panneau · ${count} sous-lien(s)` : subtitle
              }
            }
          }
        })
      ]
    }),
    defineField({
      name: 'button1',
      title: 'Button 1',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string'
        }),
        defineField({
          name: 'visible',
          title: 'Visible',
          type: 'boolean'
        }),
        defineField({
          name: 'link',
          title: 'URL de redirection',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'button2',
      title: 'Button 2',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string'
        }),
        defineField({
          name: 'visible',
          title: 'Visible',
          type: 'boolean'
        }),
        defineField({
          name: 'link',
          title: 'URL de redirection',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'button3',
      title: 'Button 3',
      type: 'object', 
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string'
        }),
        defineField({
          name: 'visible',
          title: 'Visible',
          type: 'boolean'
        }),
        defineField({
          name: 'link',
          title: 'URL de redirection',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'button4',
      title: 'Button 4',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string'
        }),
        defineField({
          name: 'visible',
          title: 'Visible',
          type: 'boolean'
        }),
        defineField({
          name: 'link',
          title: 'URL de redirection',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'button5',
      title: 'Button 5',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string'
        }),
        defineField({
          name: 'visible',
          title: 'Visible',
          type: 'boolean'
        }),
        defineField({
          name: 'link',
          title: 'URL de redirection',
          type: 'string'
        })
      ]
    })
  ]
})