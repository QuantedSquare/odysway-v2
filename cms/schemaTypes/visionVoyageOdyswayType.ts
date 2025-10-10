import {defineField, defineType} from 'sanity'

export const visionVoyageOdyswayType = defineType({
  name: 'visionVoyageOdysway',
  title: 'Vision Voyage Odysway',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'pageSettings',
      title: 'Page Settings',
    },
  ],
  fields: [
    // Page Settings Group
    defineField({
      name: 'pageSettings',
      title: 'Page Settings',
      type: 'object',
      group: 'pageSettings',
      fields: [
        // Basic page info
        defineField({
          name: 'title',
          title: 'Page Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'description',
          title: 'Page Description',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),

        // SEO Settings
        defineField({
          name: 'seo',
          title: 'SEO Settings',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'SEO Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'SEO Description',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'robots',
              title: 'Robots',
              type: 'string',
              initialValue: 'index, follow',
              options: {
                list: [
                  {title: 'Index, Follow', value: 'index, follow'},
                  {title: 'No Index, No Follow', value: 'noindex, nofollow'},
                  {title: 'Index, No Follow', value: 'index, nofollow'},
                  {title: 'No Index, Follow', value: 'noindex, follow'},
                ],
              },
            }),
          ],
        }),

        // Sitemap Settings
        defineField({
          name: 'sitemap',
          title: 'Sitemap Settings',
          type: 'object',
          fields: [
            defineField({
              name: 'lastmod',
              title: 'Last Modified',
              type: 'date',
            }),
            defineField({
              name: 'videos',
              title: 'Videos',
              type: 'array',
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
        }),

        // Social Media / OG Image Settings
        defineField({
          name: 'ogImage',
          title: 'Social Media / OG Image',
          type: 'object',
          fields: [
            defineField({
              name: 'component',
              title: 'Component',
              type: 'string',
              initialValue: 'default',
            }),
            defineField({
              name: 'props',
              title: 'OG Image Properties',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'OG Title',
                  type: 'string',
                }),
                defineField({
                  name: 'description',
                  title: 'OG Description',
                  type: 'text',
                }),
                defineField({
                  name: 'image',
                  title: 'OG Image',
                  type: 'image',
                  options: {
                    hotspot: true,
                  },
                }),
              ],
            }),
          ],
        }),

        // HTML Head Settings
        defineField({
          name: 'head',
          title: 'HTML Head Settings',
          type: 'object',
          fields: [
            defineField({
              name: 'htmlAttrs',
              title: 'HTML Attributes',
              type: 'object',
              fields: [
                defineField({
                  name: 'lang',
                  title: 'Language',
                  type: 'string',
                  initialValue: 'fr',
                }),
              ],
            }),
            defineField({
              name: 'script',
              title: 'Scripts',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
        }),
      ],
    }),

    // Content Group
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'image',
          title: 'Hero Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Hero Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'titleColor',
          title: 'Title Color',
          type: 'string',
          initialValue: 'white',
        }),
      ],
    }),

    // Prise de conscience section
    defineField({
      name: 'priseDeConscience',
      title: 'Prise de conscience',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                {title: 'Normal', value: 'normal'},
                {title: 'H2', value: 'h2'},
                {title: 'H3', value: 'h3'},
              ],
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Number', value: 'number'},
              ],
              marks: {
                decorators: [
                  {title: 'Strong', value: 'strong'},
                  {title: 'Emphasis', value: 'em'},
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }),
      ],
    }),

    // Founder section
    defineField({
      name: 'founderSection',
      title: 'Founder Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'image',
          title: 'Founder Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Image Caption',
          type: 'string',
          initialValue: 'Romain, fondateur d\'Odysway',
        }),
      ],
    }),

    // Ce que l'on défend section
    defineField({
      name: 'ceQueOnDefend',
      title: 'Ce que l\'on défend',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                {title: 'Normal', value: 'normal'},
                {title: 'H2', value: 'h2'},
                {title: 'H3', value: 'h3'},
              ],
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Number', value: 'number'},
              ],
              marks: {
                decorators: [
                  {title: 'Strong', value: 'strong'},
                  {title: 'Emphasis', value: 'em'},
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }),
      ],
    }),

    // Team section (unified rich content)
    defineField({
      name: 'teamSection',
      title: 'Une équipe à taille humaine',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
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
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Number', value: 'number'},
              ],
              marks: {
                decorators: [
                  {title: 'Strong', value: 'strong'},
                  {title: 'Emphasis', value: 'em'},
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url',
                      },
                    ],
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
        }),
      ],
    }),

  ],
  preview: {
    select: {
      title: 'pageSettings.title',
      subtitle: 'pageSettings.description',
    },
  },
})
