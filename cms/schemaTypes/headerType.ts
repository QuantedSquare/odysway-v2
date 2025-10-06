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