// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

// import 'vuetify/styles'
import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'

import { VBtn } from 'vuetify/components/VBtn'
import { VCol } from 'vuetify/components'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'odysway',
      themes: {
        odysway: {
          dark: false,
          colors: {
            primary: '#2e8b57', // odysway green
            secondary: '#bc5948', // odysway red
            cream: '#F4F2EB',
          },
        },
      },
    },
    aliases: {
      VBtnPrimary: VBtn,
      VBtnSecondary: VBtn,
      VColSectionTitle: VCol,
    },
    defaults: {
      VBtnPrimary: {
        color: 'secondary',
        rounded: 'xl',
      },
      VBtnSecondary: {
        variant: 'text',
        color: 'primary',
      },
      VColSectionTitle: {
        cols: '9',
        class: 'py-12',
      },
    },
  })

  app.vueApp.use(vuetify)
})
