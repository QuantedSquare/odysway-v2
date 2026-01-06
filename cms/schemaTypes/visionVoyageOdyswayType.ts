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
      name: 'seo',
      title: 'SEO Settings',
    },
  ],
  fields: [
    
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

    // SEO Settings
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
      description: 'Configuration SEO pour la page vision voyage odysway',
    }),
  ],
  preview: {
    select: {
      title: 'heroSection.title',
    },
  },
})
