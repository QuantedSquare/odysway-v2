import {defineField, defineType} from 'sanity'

const richTextBlock = {
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
}

const imageBlock = {
  type: 'image',
  title: 'Image',
  options: {
    hotspot: true,
  },
}



export const entrepriseType = defineType({
  name: 'entreprise',
  title: 'Page Entreprise',
  type: 'document',
  groups: [

    {
      name: 'hero',
      title: 'Hero Section',
      default: true,
    },
    {
      name: 'contentBlock1',
      title: 'Des expériences uniques',
    },
    {
      name: 'contentBlock2',
      title: 'Séminaires d\'entreprise',
    },
    {
      name: 'contentBlock3',
      title: 'Voyages d\'entreprise',
    },
    {
      name: 'contentBlock4',
      title: 'Offre responsable',
    },
    {
      name: 'contentBlock5',
      title: 'Clients satisfaits',
    },
    {
      name: 'cta',
      title: 'Boutons CTA',
    },
    {
      name: 'seo',
      title: 'SEO Settings',
    },
  ],
  preview: {
    select: {
      title: 'heroSection.title',
    },
  },
  fields: [
      // SEO Settings
      defineField({
        name: 'seo',
        title: 'SEO Settings',
        type: 'seo',
        group: 'seo',
        description: 'Configuration SEO pour la page entreprise (og:type = "website", structuredData = "Organization")',
      }),

    // Hero Section
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'image',
          title: 'Image Hero',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Titre Hero',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    // Content Blocks
    defineField({
      name: 'contentBlock1',
      title: 'Bloc 1 - Des expériences uniques',
      type: 'array',
      group: 'contentBlock1',
      of: [
        richTextBlock,
        imageBlock,
      ],
    }),

    defineField({
      name: 'contentBlock2',
      title: 'Bloc 2 - Séminaires d\'entreprise',
      type: 'array',
      group: 'contentBlock2',
      of: [
        richTextBlock,
        imageBlock,
      ],
    }),

    defineField({
      name: 'contentBlock3',
      title: 'Bloc 3 - Voyages d\'entreprise',
      type: 'array',
      group: 'contentBlock3',
      of: [
        richTextBlock,
        imageBlock,
      ],
    }),

    defineField({
      name: 'contentBlock4',
      title: 'Bloc 4 - Offre responsable',
      type: 'array',
      group: 'contentBlock4',
      of: [
        richTextBlock,
        imageBlock,
      ],
    }),

    defineField({
      name: 'contentBlock5',
      title: 'Bloc 5 - Clients satisfaits',
      type: 'array',
      group: 'contentBlock5',
      of: [
        richTextBlock,
        imageBlock,
      ],
    }),

    // CTA Button (single, since all are the same)
    defineField({
      name: 'ctaButton',
      title: 'Bouton CTA',
      type: 'object',
      group: 'cta',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte du bouton',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'link',
          title: 'Lien',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['http', 'https']}),
        }),
        defineField({
          name: 'external',
          title: 'Lien externe',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
  ],
})
