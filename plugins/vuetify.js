// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

// import 'vuetify/styles'
import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'

import { VBtn } from 'vuetify/components/VBtn'

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
            cream: '#F4F2EB', // banner bg
            textColor: '#3e3e3e',
          },
        },
      },
    },
    aliases: {
      VBtnPrimary: VBtn,
      VBtnSecondary: VBtn,
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
    },
  })

  app.vueApp.use(vuetify)
})
