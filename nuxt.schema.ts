import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  appConfig: {
    parent: group({
      title: 'Parent title',
      description: 'Parent description.',
      fields: {
        leaf: field({
          type: 'Type of component used to edit your field',
          title: 'Field title',
          description: 'Field Description',
          icon: 'i-icon-to-display',
          default: 'default value',
        }),
      },
    }),
  },
  voyages: group({
    title: 'Voyages',
    description: 'Liste des voyages',
    fields: {
      title: field({
        type: 'string',
        title: 'Titre',
        description: 'Titre du voyage',
      }),
    },
  }),
})
