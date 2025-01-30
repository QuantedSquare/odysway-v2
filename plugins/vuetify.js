// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

// import 'vuetify/styles'
import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'

import { VBtn, VIcon } from 'vuetify/components'

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
            sectionBg: '#edeff8',
          },
        },
      },
    },
    aliases: {
      VBtnPrimary: VBtn,
      VBtnSecondary: VBtn,
      VBtnVoyage: VBtn,
      VIconChevron: VIcon,
    },
    defaults: {
      VBtnPrimary: {
        color: 'primary',
        rounded: 'xl',
      },
      VBtnSecondary: {
        variant: 'text',
        class: 'bg-secondary',
      },
      VBtnVoyage: {
        size: 'x-small',
        icon: true,
        color: 'rgba(0, 0, 0, 0.54)',
      },
      VIconChevron: {
        size: 'x-large',
        color: 'white',
      },
    },
  })

  app.vueApp.use(vuetify)
})
