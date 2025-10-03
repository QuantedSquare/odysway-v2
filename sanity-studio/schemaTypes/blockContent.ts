import {defineType} from 'sanity'

export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block',
      title: 'Bloc de texte',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Citation', value: 'blockquote'},
      ],
      lists: [
        {title: 'Puces', value: 'bullet'},
        {title: 'Numéroté', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Gras', value: 'strong'},
          {title: 'Italique', value: 'em'},
          {title: 'Code', value: 'code'},
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
                validation: (rule) => rule.required(),
              },
              {
                name: 'openInNewTab',
                type: 'boolean',
                title: 'Ouvrir dans un nouvel onglet',
                initialValue: false,
              },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
          validation: (rule) => rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Légende',
        },
      ],
    },
    {
      type: 'object',
      name: 'callout',
      title: 'Encadré important',
      fields: [
        {
          name: 'title',
          type: 'string',
          title: 'Titre de l\'encadré',
        },
        {
          name: 'content',
          type: 'array',
          of: [{type: 'block'}],
          title: 'Contenu',
        },
        {
          name: 'type',
          type: 'string',
          title: 'Type',
          options: {
            list: [
              {title: 'Info', value: 'info'},
              {title: 'Attention', value: 'warning'},
              {title: 'Succès', value: 'success'},
            ],
          },
          initialValue: 'info',
        },
      ],
      preview: {
        select: {
          title: 'title',
          type: 'type',
        },
        prepare({title, type}) {
          return {
            title: title || 'Encadré',
            subtitle: type ? `Type: ${type}` : '',
          }
        },
      },
    },
  ],
})
