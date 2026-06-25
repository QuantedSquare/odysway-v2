import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'settings', title: 'Settings'},
    {name: 'seo', title: 'SEO'},
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
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alt Text'} as any],
      group: 'content',
    }),
    defineField({
      name: 'icon',
      title: 'Icône (carte d\'accueil)',
      type: 'string',
      description: 'Icône affichée devant le titre sur la carte de la home',
      options: {
        list: [
          {title: 'Trek / randonnée', value: 'trek'},
          {title: 'Rencontres locales', value: 'rencontres'},
          {title: 'Faune sauvage', value: 'faune'},
          {title: 'Déconnexion', value: 'deconnexion'},
          {title: 'Familles d\'accueil', value: 'familles'},
          {title: 'Désert', value: 'desert'},
          {title: 'Montagne', value: 'montagne'},
          {title: 'Spiritualité', value: 'spiritualite'},
          {title: 'Gastronomie', value: 'gastronomie'},
          {title: 'Mer / océan', value: 'mer'},
          {title: 'Animaux', value: 'animaux'},
        ],
      },
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
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
})
