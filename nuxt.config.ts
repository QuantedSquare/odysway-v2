// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxthq/studio',
    '@nuxt/fonts',
    '@nuxt/content',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error This come from Vuetify doc.
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  compatibilityDate: '2024-11-01',
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  // css: ['~/assets/scss/main.scss'],
})
