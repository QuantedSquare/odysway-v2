import {defineField, defineType} from 'sanity'

export const avisVoyageursType = defineType({
  name: 'avisVoyageurs',
  title: 'Page Avis Voyageurs',
  type: 'document',
  preview: {
    select: {
      title: 'heroSection.title',
    },
  },
  fields: [
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
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

    defineField({
      name: 'firstPhrase',
      title: 'Première Phrase',
      type: 'string',
      description: 'Texte qui apparaît avant la note (e.g., "en moyenne sur")',
    }),
    defineField({
      name: 'secondPhrase',
      title: 'Deuxième Phrase',
      type: 'text',
      rows: 3,
      description: 'Texte principal',
    }),
  ],
})
