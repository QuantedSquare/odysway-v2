// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-calendly',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error This come from Vuetify doc.
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  components: [
    '~/components',
    { path: '~/components/content', pathPrefix: false },
  ],
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        { src: 'https://embed.small.chat/TD5UA8M5KC05K7GGNJNM.js', async: true },
      ],
    },
  },
  content: {
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true,
    },
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL || 'postgres://localhost:5432/nuxt',
    },
  },
  runtimeConfig: {
    public: {
      environment: process.env.VERCEL_ENV || 'development',
      siteURL: process.env.VERCEL_URL || 'http://localhost:3000',
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  routeRules: {
    '/': { prerender: true },
    '/api/**': { cors: true },
  },
  // ot sure this improve a lot.
  features: {
    inlineStyles: false,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    imports: {
      dirs: [
        'server/utils/**',
      ],
    },
  },
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
