import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  appConfig: {
    ui: group({
      title: 'UI',
      description: 'UI description',
      fields: {
        test: field({
          type: 'string',
          title: 'Test',
          description: 'Test de field',
        }),
        arr: field({
          type: 'array',
          title: 'Array',
          description: 'Test array',
        }),
      },
    }),
  },
})
