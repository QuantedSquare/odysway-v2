import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  ui: group({
    title: 'UI',
    description: 'UI description',
    fields: {
      test: field({
        type: 'string',
        title: 'Test',
        description: 'Test de field',
      }),
    },
  }),
})
