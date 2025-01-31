// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxt/image',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error This come from Vuetify doc.
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  components: [
    { path: '~/components/content', pathPrefix: false },
  ],
  devtools: { enabled: true },
  content: {
    preview: {
      api: 'https://api.nuxt.studio',
    },
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL,
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  routeRules: {
    '/': { prerender: true },
  },
  // ot sure this improve a lot.
  features: {
    inlineStyles: false,
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
  // image: {
  //   inject: true,
  //   format: ['webp'],
  //   quality: 70,
  // },
  // css: ['~/assets/scss/main.scss'],
})
