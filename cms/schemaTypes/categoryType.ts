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
    // Basic Info (from JSON)
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
      // SEO Settings
      defineField({
        name: 'seo',
        title: 'SEO Settings',
        type: 'seo',
        group: 'seo',
        description: 'Configuration SEO pour la page d\'accueil (og:type = "website", structuredData = "Organization")',
      }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alt Text'} as any],
      group: 'content',
    }),
    defineField({
      name: 'showOnHome',
      type: 'boolean',
      initialValue: false,
      description: 'Display this category on the homepage',
      group: 'settings',
    }),
    defineField({
      name: 'blog',
      type: 'reference',
      title: 'Blog Post',
      description: 'The blog post associated with this category',
      to: [{type: 'blog'}],
      group: 'content',
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
