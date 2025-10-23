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

   
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'metadata',
    }),


    // SEO
      // SEO Settings
      defineField({
        name: 'seo',
        title: 'SEO Settings',
        type: 'seo',
        group: 'seo',
        description: 'Configuration SEO pour ce blog post',
      }),

    // Blog metadata
    defineField({
      name: 'readingTime',
      type: 'string',
      description: 'Estimated reading time (e.g., "3 min")',
      group: 'metadata',
    }),
    defineField({
      name: 'legacyCategories',
      type: 'string',
      title: 'Legacy Categories',
      description: 'Original category string from Nuxt Content frontmatter',
      group: 'metadata',
    }),

    // Migration metadata - used to link blogs to categories/destinations
    defineField({
      name: 'categorySlug',
      type: 'string',
      title: 'Category Slug',
      description: 'Folder name of the category this blog belongs to (for migration linking)',
      group: 'metadata',
    }),
    defineField({
      name: 'destinationSlug',
      type: 'string',
      title: 'Destination Slug',
      description: 'Folder name of the destination this blog belongs to (for migration linking)',
      group: 'metadata',
    }),
    defineField({
      name: 'testMigrationField',
      type: 'string',
      title: 'Test Migration Field',
      description: 'Test field to verify migration updates work',
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
