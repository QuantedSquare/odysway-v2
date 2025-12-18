import {defineField, defineType} from 'sanity'

export const voyageCardType = defineType({
  name: 'voyage_card',
  title: 'Carte Voyage',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Carte Voyage',
        subtitle: 'Textes pour les cartes de voyage'
      }
    }
  },
  fields: [
    defineField({
      name: 'type',
      title: 'Label Type',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'groupType',
      title: 'Type Petits groupes',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'indivDescription',
      title: 'Description Individuel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'soloType',
      title: 'Type Solo',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'days',
      title: 'Label Jours',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'startingFrom',
      title: 'Texte "À partir de"',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'discoverDates',
      title: 'Texte bouton "Voir les dates"',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'requestQuote',
      title: 'Texte bouton "Demander un devis"',
      type: 'string',
      validation: Rule => Rule.required()
    })
  ]
})
