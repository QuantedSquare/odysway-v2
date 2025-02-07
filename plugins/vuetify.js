import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import { VBtn, VIcon, VTextField } from 'vuetify/components'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'odysway',
      themes: {
        odysway: {
          dark: false,
          colors: {
            primary: '#2e8b57', // odysway green
            secondary: '#bc5948', // odysway red
            cream: '#F4F2EB', // banner bg
            dark: '#3e3e3e', // dark grey usually applied on text
            sectionBg: '#edeff8', // grey-home-bg
            pinkBorder: '#ffc0cb',
            inputBg: '#ebeff9',
            footerBg: '#f5f5f5',
          },
        },
      },
    },
    aliases: {
      VBtnPrimary: VBtn,
      VBtnSecondary: VBtn,
      VBtnVoyage: VBtn,
      VIconChevron: VIcon,
      VBtnSocial: VBtn,
      VTextFieldHome: VTextField,
    },
    defaults: {
      VBtnPrimary: {
        color: 'primary',
        variant: 'text',
      },
      VBtnSecondary: {
        color: 'secondary',
        rounded: 'xl',
      },
      VBtnVoyage: {
        size: 'x-small',
        icon: true,
        color: 'rgba(0, 0, 0, 0.32)',
      },
      VIconChevron: {
        size: 'x-large',
        color: 'white',
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
      VBtnSocial: {
        size: 'x-small',
        icon: true,
      },
      VTextFieldHome: {
        variant: 'solo',
        flat: true,
        hideDetails: true,
        density: 'compact',
        rounded: 'xl',
      },
    },
  })

  app.vueApp.use(vuetify)
})
