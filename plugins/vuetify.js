import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import { VBtn } from 'vuetify/components'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    display: {
      mobileBreakpoint: 600,
    },
    ssr: true,
    theme: {
      defaultTheme: 'odysway',
      themes: {
        odysway: {
          dark: false,
          colors: {
            'primary': '#2e8b57', // odysway green
            'secondary': '#bc5948', // odysway red
            'cream': '#f5f5f0', // banner bg
            'dark': '#3e3e3e', // dark grey usually applied on text
            'odysway-1': '#edeff8', // grey-home-bg
            'odysway-2': '#f5f5f5',
            'orange-lighten-1': '#FFA726',
            'white': '#FFFFFF',
            'grey': '#8E8E8E',
            'grey-lighten-1': '#C7C7C7',
            'grey-lighten-2': '#E9EAEC',
            'grey-lighten-3': '#F8F8F8',
            'grey-lighten-4': '#C5C7C9',
            'grey-darken-1': '#61615F',
            'grey-darken-2': '#737774',
            'grey-darken-3': '#4A4A48',
          },
        },
      },
    },
    aliases: {
      VBtnPrimary: VBtn,
      VBtnSecondary: VBtn,
    },
    defaults: {
      VCard: {
        rounded: 'lg',
      },
      VBtn: {
        color: 'primary',
        elevation: 0,
      },
      VBtnPrimary: {
        color: 'primary',
        variant: 'text',
      },
      VBtnSecondary: {
        color: 'secondary',
      },
      VTextField: {
        variant: 'outlined',
      },
      VSelect: {
        variant: 'outlined',
      },
      VSwitch: {
        color: 'primary',
        baseColor: 'grey-lighten-1',
        inset: true,
        hideDetails: true,
      },
    },
  })

  app.vueApp.use(vuetify)
})
