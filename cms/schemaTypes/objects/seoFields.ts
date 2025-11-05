import {defineField, defineType} from 'sanity'
import { CharacterCounter } from '../components/characterCounter'

export const seoFields = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    // Basic SEO
    defineField({
      name: 'metaTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Titre SEO (max 60 caractères). Si vide, le titre de la page sera utilisé.',
      validation: (Rule) => Rule.max(60).warning('Devrait être inférieur à 60 caractères'),
      components: {
        input: (props) => CharacterCounter(props, {maxLength: 60}),
      },
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Description SEO (max 160 caractères). Utilisée dans les résultats de recherche.',
      validation: (Rule) => Rule.max(160).warning('Devrait être inférieur à 160 caractères'),
      components: {
        input: (props) => CharacterCounter(props, {maxLength: 160}),
      },
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'URL Canonique',
      type: 'url',
      description: "L'URL principale de la page (ex: https://odysway.com/voyages/immersion-japon). Laisser vide pour utiliser l'URL par défaut.",
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Mot-clé Principal',
      type: 'string',
      description: 'Mot-clé principal pour cette page/contenu',
    }),
    defineField({
      name: 'keywords',
      title: 'Mots-clés',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Mots-clés additionnels pour ce contenu',
    }),
    defineField({
      name: 'robotsIndex',
      title: 'Autoriser l\'indexation par les moteurs de recherche',
      type: 'boolean',
      initialValue: true,
      description: 'Si décoché, les moteurs de recherche n\'indexeront pas cette page',
    }),
    defineField({
      name: 'robotsFollow',
      title: 'Autoriser le suivi des liens',
      type: 'boolean',
      initialValue: true,
      description: 'Si décoché, les moteurs de recherche ne suivront pas les liens de cette page',
    }),

    // Open Graph (réseaux sociaux)
    defineField({
      name: 'ogTitle',
      title: 'Open Graph Title',
      type: 'string',
      description: 'Titre pour le partage social (Facebook, LinkedIn). Par défaut = SEO Title.',
      validation: (Rule) => Rule.max(60),
      components: {
        input: (props) => CharacterCounter(props, {maxLength: 60}),
      },
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph Description',
      type: 'text',
      rows: 2,
      description: 'Description pour le partage social. Par défaut = SEO Description.',
      validation: (Rule) => Rule.max(160),
      components: {
        input: (props) => CharacterCounter(props, {maxLength: 160}),
      },
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image de partage social HD (recommandé: 1200x630px). Si vide, l\'image principale sera utilisée.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
          description: 'Ex: "Voyage immersif au Japon avec Odysway"',
        },
      ],
    }),
  ],
})

