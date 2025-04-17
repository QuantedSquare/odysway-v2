import { field, group } from '@nuxt/content/preview'

export default defineNuxtSchema({
  appConfig: {
    parent: group({
      title: 'Parent title',
      description: 'Parent description.',
      icon: 'i-icon-to-display',
      fields: {
        leaf: field({
          type: 'string',
          title: 'Field title',
          description: 'Field Description',
          icon: 'i-icon-to-display',
          default: 'default value',
        }),
      },
    }),
  },
})
declare module '@nuxt/schema' {
  interface CustomAppConfig {
    ui: {
      icons: object
    }
  }
}
