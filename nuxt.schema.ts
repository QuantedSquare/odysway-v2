import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  theme: field({
    type: 'string',
    title: 'Theme',
    description: 'theme du site',
  }),
  test: field({
    type: 'string',
    title: 'TEST',
    description: 'TEST',
  }),
})
