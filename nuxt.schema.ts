import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  appConfig: {
    ui: group({
      title: 'UI',
      description: 'UI description',
      // icon: 'i-icon-to-display',
      fields: {
        theme: field({
          type: 'string',
          title: 'Theme',
          description: 'Nom du theme',
        }),
        test: field({
          type: 'string',
          title: 'Test',
          description: 'Test de field',
        }),
      },
    }),
  },
})
