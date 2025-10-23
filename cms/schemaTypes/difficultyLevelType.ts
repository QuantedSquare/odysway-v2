import {defineField, defineType} from 'sanity'

export const difficultyLevelType = defineType({
  name: 'difficultyLevel',
  title: 'Niveau de Difficulté',
  type: 'document',
  fields: [
    defineField({
      name: 'level',
      type: 'number',
      title: 'Numéro du niveau',
      description: 'Niveau de 1 à 5',
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titre du niveau',
      description: 'Ex: Premiers pas, Exploration, Aventure, etc.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description complète',
      description: 'Description détaillée du niveau avec activités et immersion',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          marks: {
            decorators: [
              {title: 'Gras', value: 'strong'},
              {title: 'Italique', value: 'em'},
            ],
          },
        },
      ],
      validation: (rule) => rule.required(),
    })
  ],
  preview: {
    select: {
      level: 'level',
      title: 'title',
      emoji: 'emoji',
    },
    prepare({level, title, emoji}) {
      return {
        title: `Niveau ${level} : ${title}`,
        subtitle: `Niveau ${level}`,
      }
    },
  },
  orderings: [
    {
      title: 'Niveau (croissant)',
      name: 'levelAsc',
      by: [{field: 'level', direction: 'asc'}],
    },
  ],
})
