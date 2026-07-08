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
      title: 'Icône (carte "Voyager selon vos envies")',
      type: 'string',
      description: 'Icône affichée devant le titre sur la carte de la home. Laisser vide pour n\'afficher aucun picto.',
      options: {
        list: [
          // Nature & paysages
          {title: '🏔️ Montagne', value: 'montagne'},
          {title: '🏜️ Désert', value: 'desert'},
          {title: '🌊 Mer / océan', value: 'mer'},
          {title: '🌴 Jungle / forêt tropicale', value: 'jungle'},
          {title: '🍂 Automne', value: 'automne'},
          {title: '❄️ Hiver / neige', value: 'hiver'},
          // Faune & activités
          {title: '🦌 Faune sauvage', value: 'faune'},
          {title: '🐾 Animaux', value: 'animaux'},
          {title: '🥾 Trek / randonnée', value: 'trek'},
          {title: '🚴 Vélo', value: 'velo'},
          {title: '⛵ Navigation / voile', value: 'voile'},
          {title: '🚗 Road trip', value: 'roadtrip'},
          {title: '📷 Voyage photo', value: 'photo'},
          // Culture & rencontres
          {title: '🤝 Rencontres locales', value: 'rencontres'},
          {title: '🏠 Familles d\'accueil', value: 'familles'},
          {title: '🍽️ Gastronomie', value: 'gastronomie'},
          {title: '⛩️ Asie', value: 'asie'},
          {title: '🏛️ Culture & patrimoine', value: 'culture'},
          {title: '🙏 Spiritualité', value: 'spiritualite'},
          {title: '🔭 Astronomie', value: 'astronomie'},
          // Bien-être
          {title: '🧘 Déconnexion', value: 'deconnexion'},
        ],
        layout: 'dropdown',
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
