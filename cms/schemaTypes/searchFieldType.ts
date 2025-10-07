import {defineField, defineType} from 'sanity'

export const searchFieldType = defineType({
  name: 'search_field',
  title: 'Champ de Recherche',
  type: 'document',
  preview: {
    prepare() {
      return {
        title: 'Champ de Recherche',
        subtitle: 'Textes pour le champ de recherche'
      }
    }
  },
  fields: [
    defineField({
      name: 'destination',
      title: 'Label Destination',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'travelType',
      title: 'Label Type de voyage',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'period',
      title: 'Label Période',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'discoverTrips',
      title: 'Texte bouton découvrir les voyages',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'topDestinations',
      title: 'Texte top destinations',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'allPeriods',
      title: 'Texte toutes périodes',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'travelTypes',
      title: 'Types de voyage',
      type: 'object',
      fields: [
        defineField({
          name: 'individual',
          title: 'Voyage individuel',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'group',
          title: 'Voyage en petits groupes',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
