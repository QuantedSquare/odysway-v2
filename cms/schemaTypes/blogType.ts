import {defineField, defineType} from 'sanity'

export const blogType = defineType({
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'badges', title: 'Badges'},
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

    // Badges
    defineField({
      name: 'badges',
      type: 'array',
      title: 'Badges du blog',
      description: 'Sélectionnez et personnalisez les badges pour ce blog',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'badge',
              type: 'reference',
              to: [{type: 'badge'}],
              title: 'Badge',
              validation: (rule: any) => rule.required(),
            } as any,
            {
              name: 'variable1Value',
              type: 'string',
              title: 'Variable 1 (optionnel)',
              description: 'Remplace {var1} dans le texte du badge',
            } as any,
            {
              name: 'variable2Value',
              type: 'string',
              title: 'Variable 2 (optionnel)',
              description: 'Remplace {var2} dans le texte du badge',
            } as any,
            {
              name: 'overrideText',
              type: 'string',
              title: 'Remplacer complètement le texte (optionnel)',
              description: 'Remplace entièrement le texte du badge',
            } as any,
          ],
          preview: {
            select: {
              badgeText: 'badge.text',
              badgePicto: 'badge.picto',
              variable1Value: 'variable1Value',
              variable2Value: 'variable2Value',
              overrideText: 'overrideText',
            },
            prepare({badgeText, badgePicto, variable1Value, variable2Value, overrideText}: any) {
              let displayText = badgeText || 'Badge'

              if (overrideText) {
                displayText = overrideText
              } else if (badgeText) {
                if (variable1Value) {
                  displayText = displayText.replace(/\{var1\}/g, variable1Value)
                }
                if (variable2Value) {
                  displayText = displayText.replace(/\{var2\}/g, variable2Value)
                }
              }

              let subtitle = 'Badge standard'
              if (overrideText) {
                subtitle = 'Texte personnalisé'
              } else if (variable1Value || variable2Value) {
                const vars = [variable1Value, variable2Value].filter(Boolean).join(', ')
                subtitle = `Variables: ${vars}`
              }

              return {
                title: displayText,
                subtitle,
                media: badgePicto,
              }
            },
          },
        },
      ],
      group: 'badges',
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
