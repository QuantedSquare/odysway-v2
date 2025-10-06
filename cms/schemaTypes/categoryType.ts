import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    // Basic Info
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'discoveryTitle',
      type: 'string',
      description: 'Titre pour la page de découverte',
      group: 'content',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Short description for listings',
      group: 'content',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alt Text'} as any,
      ],
      group: 'content',
    }),

    // Rich Content (from MD)
    defineField({
      name: 'body',
      title: 'Page Content',
      type: 'array',
      description: 'Rich content for the category landing page',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
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
                  {name: 'href', type: 'url', title: 'URL'},
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt Text'},
            {name: 'caption', type: 'string', title: 'Caption'},
          ],
        },
      ],
      group: 'content',
    }),

    // Author & Publishing
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'teamMember'}],
      description: 'Author of the category page content',
      group: 'content',
    }),
    defineField({
      name: 'published',
      type: 'boolean',
      initialValue: false,
      group: 'settings',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'settings',
    }),
    defineField({
      name: 'showOnHome',
      type: 'boolean',
      initialValue: false,
      group: 'settings',
    }),

    // SEO
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO Title',
      description: 'Title for search engines (max 60 chars)',
      validation: (rule) => rule.max(60),
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO Description',
      description: 'Description for search engines (max 160 chars)',
      rows: 3,
      validation: (rule) => rule.max(160),
      group: 'seo',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      group: 'seo',
    }),

    // Legacy fields (can be removed after migration if not needed)
    defineField({
      name: 'readingTime',
      type: 'string',
      description: 'Estimated reading time (e.g., "3 min")',
      group: 'settings',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
})

