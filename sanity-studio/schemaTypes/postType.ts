import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Titre principal de l\'article',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      description: 'URL de l\'article (généré automatiquement)',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
      description: 'Sélectionnez l\'auteur de l\'article',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Catégories de l\'article (optionnel)',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Résumé court de l\'article (affiché dans les listes)',
      validation: (rule) => rule.max(200).warning('L\'extrait est un peu long'),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      description: 'Date de publication',
    }),
    defineField({
      name: 'image',
      type: 'image',
              options: {
          hotspot: true,
        },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
          description: 'Description de l\'image pour l\'accessibilité',
          validation: (rule) => rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Légende',
          description: 'Légende optionnelle sous l\'image',
        },
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Contenu de l\'article',
      description: 'Utilisez les outils ci-dessous pour créer votre contenu',
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
          of: [
            {
              type: 'image',
              title: 'Image inline',
              options: {
                hotspot: true,
              },
            },
          ],
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
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Bloc de code',
          fields: [
            {
              name: 'code',
              type: 'text',
              title: 'Code',
              rows: 10,
            },
            {
              name: 'language',
              type: 'string',
              title: 'Langage',
              options: {
                list: [
                  {title: 'JavaScript', value: 'javascript'},
                  {title: 'HTML', value: 'html'},
                  {title: 'CSS', value: 'css'},
                  {title: 'Python', value: 'python'},
                  {title: 'JSON', value: 'json'},
                ],
              },
            },
          ],
          preview: {
            select: {
              language: 'language',
            },
            prepare({language}) {
              return {
                title: 'Code',
                subtitle: language ? `Langage: ${language}` : '',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Related posts',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
      description: 'Articles liés (optionnel)',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Titre SEO',
          description: 'Titre pour les moteurs de recherche (max 60 caractères)',
          validation: (rule) => rule.max(60).warning('Titre un peu long pour le SEO'),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Description SEO',
          description: 'Description pour les moteurs de recherche (max 160 caractères)',
          rows: 3,
          validation: (rule) => rule.max(160).warning('Description un peu longue pour le SEO'),
        },
        {
          name: 'keywords',
          type: 'array',
          title: 'Mots-clés',
          of: [{type: 'string'}],
          description: 'Mots-clés pour le référencement',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      authorName: 'author.name',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const {title, media, authorName, publishedAt} = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('fr-FR') : 'Non publié'
      return {
        title,
        subtitle: authorName ? `par ${authorName} • ${date}` : date,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Date de publication, récent',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Date de publication, ancien',
      name: 'publishedAtAsc',
      by: [{field: 'publishedAt', direction: 'asc'}],
    },
    {
      title: 'Titre, A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})