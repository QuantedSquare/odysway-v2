// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineOrganization } from 'nuxt-schema-org/schema'

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
    pageTransition: { name: 'page', mode: 'out-in' },

  },
  site: {
    url: process.env.NUXT_SITE_URL || 'https://odysway.com', // TODO: change the first to the dev env
    name: process.env.NUXT_SITE_NAME || 'Odysway',
    indexable: process.env.NUXT_SITE_ENV === 'production',
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
  schemaOrg: {
    identity: defineOrganization({
      '@type': ['Organization', 'TravelAgency', 'OnlineStore'],

      // Basic Information
      'name': 'ODYSWAY',
      'alternateName': 'Odysway - Voyages en immersion',
      'description': 'Odysway est l\'agence spécialiste des voyages en immersion. Nous proposons un tourisme authentique et responsable qui vous fera voyager différemment.',
      'url': 'https://odysway.com',
      'logo': '/logos/logo_noir.png',

      // Contact Information
      'email': 'contact@odysway.com',
      'telephone': '+ 33 (0) 1 84 80 79 75',
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'contactType': 'service client',
          'telephone': '+ 33 (0) 1 84 80 79 75',
          'email': 'contact@odysway.com',
          'availableLanguage': ['French', 'English'],
          'hoursAvailable': {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'opens': '09:30:00',
            'closes': '18:30:00',
          },
        },
      ],

      // Business Details
      'foundingDate': '2018-01-01',
      'founder': {
        '@type': 'Person',
        'name': 'Alexandre Ottmann',
      },

      // Legal Information
      'legalName': 'ODYSWAY SAS',
      'priceRange': '€€',

      // Business Address
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '27 avenue Nicolas Boileau',
        'addressLocality': 'Le Plessis Trévise',
        'postalCode': '94420',
        'addressCountry': 'FR',
      },

      // Return & Cancellation Policy
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'name': 'Politique d\'annulation standard',
        'merchantReturnDays': '30',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
      },

      // Payment Methods
      'paymentAccepted': [
        'Carte bancaire',
        'Virement bancaire',
        'Chèque',
        'Chèques-vacances',
      ],
      'currenciesAccepted': ['EUR'],

      // Social Media
      'sameAs': [
        'https://www.facebook.com/odysway',
        'https://www.instagram.com/odysway',
        'https://www.linkedin.com/company/odysway',
      ],

      // Trust Indicators
      // 'hasCredential': [
      //   {
      //     '@type': 'EducationalOccupationalCredential',
      //     'credentialCategory': 'Immatriculation Atout France',
      //     'url': 'https://registre-operateurs-de-voyages.atout-france.fr',
      //   },
      // ],

      // Business Keywords
      'slogan': 'La rencontre au cœur du voyage',
      'keywords': [
        'voyage en immersion',
        'tourisme responsable',
        'voyage authentique',
        'agence de voyage',
        'séjour immersif',
        'voyage durable',
        'voyage en petit groupe',
      ],

      // Business Hours
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '09:30:00',
          'closes': '18:30:00',
        },
      ],
    }),
  },
  seo: {
    meta: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      description: 'Odysway est une agence de voyage en ligne, qui propose des expériences de voyage différentes, loin des circuits touristiques classiques.',
      ogTitle: process.env.npm_package_name,
      ogType: 'website',
      ogDescription: 'Odysway est une agence de voyage en ligne, qui propose des expériences de voyage différentes, loin des circuits touristiques classiques.',
      twitterCreator: '@odysway',
      twitterSite: '@odysway',
      author: 'Quanted Square',
      colorScheme: 'light',
      applicationName: 'Odysway',
      google: 'nopagereadaloud',
      googlebot: 'max-snippet',
    },
  },
  // image: {
  //   inject: true,
  //   format: ['webp'],
  //   quality: 70,
  // },
  // css: ['~/assets/scss/main.scss'],
})
