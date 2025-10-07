import {defineField, defineType} from 'sanity'

export const blogType = defineType({
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
    {name: 'metadata', title: 'Metadata'},
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
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Short description for listings',
      group: 'content',
    }),

    // Featured Image
    defineField({
      name: 'displayedImg',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alt Text'} as any],
      group: 'content',
    }),

    // Rich Content (from markdown)
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      description: 'Blog post content',
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
                title: 'External Link',
                fields: [{name: 'href', type: 'url', title: 'URL'}],
              },
              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal Link / Anchor',
                fields: [
                  {
                    name: 'href',
                    type: 'string',
                    title: 'Path or Anchor',
                    description: 'E.g. /voyages/sri-lanka or #section-name',
                  },
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
      validation: (rule) => rule.required(),
    }),

    // Author
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'teamMember'}],
      description: 'Author of the blog post',
      group: 'content',
    }),

    // Publishing
    defineField({
      name: 'published',
      type: 'boolean',
      initialValue: false,
      group: 'metadata',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'metadata',
    }),

    // Navigation (optional override for navigation display)
    defineField({
      name: 'navigationTitle',
      type: 'string',
      title: 'Navigation Title',
      description: 'Override title for navigation (from frontmatter navigation.title)',
      group: 'content',
    }),
    defineField({
      name: 'navigationDescription',
      type: 'text',
      title: 'Navigation Description',
      description: 'Override description for navigation (from frontmatter navigation.description)',
      rows: 2,
      group: 'content',
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

    // Blog metadata
    defineField({
      name: 'readingTime',
      type: 'string',
      description: 'Estimated reading time (e.g., "3 min")',
      group: 'metadata',
    }),
    defineField({
      name: 'blogType',
      type: 'string',
      description: 'Blog post type',
      options: {
        list: [
          {title: 'Actu', value: 'Actu'},
          {title: 'Guide', value: 'Guide'},
          {title: 'Inspiration', value: 'Inspiration'},
        ],
      },
      group: 'metadata',
    }),
    defineField({
      name: 'badgeColor',
      type: 'string',
      description: 'Badge color for display',
      options: {
        list: [
          {title: 'Primary', value: 'primary'},
          {title: 'Secondary', value: 'secondary'},
          {title: 'Success', value: 'success'},
          {title: 'Warning', value: 'warning'},
          {title: 'Danger', value: 'danger'},
        ],
      },
      group: 'metadata',
    }),
    defineField({
      name: 'legacyCategories',
      type: 'string',
      title: 'Legacy Categories',
      description: 'Original category string from Nuxt Content frontmatter',
      group: 'metadata',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'displayedImg',
      published: 'published',
    },
    prepare({title, subtitle, media, published}) {
      return {
        title: title,
        subtitle: subtitle ? `${subtitle} ${published ? '' : '(Draft)'}` : published ? '' : 'Draft',
        media: media,
      }
    },
  },
})
