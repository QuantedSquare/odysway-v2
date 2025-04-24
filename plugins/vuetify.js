import '@/assets/scss/main.scss'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { VDateInput } from 'vuetify/labs/VDateInput'
import DayjsAdapter from '@date-io/dayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

import { fr } from 'vuetify/locale'

import { VBtn } from 'vuetify/components'

dayjs.locale('fr')

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    locale: {
      locale: 'fr',
      messages: { fr },
    },
    date: {
      adapter: DayjsAdapter,
      locale: 'fr',
    },
    components: {
      VDateInput,
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
            'primary': 'rgba(43, 76, 82, 1)',
            'text': 'rgba(43, 76, 82, 1)',
            'primary-light': 'rgba(43, 76, 82, 0.8)',
            'primary-light-2': 'rgba(43, 76, 82, 0.6)',
            'primary-light-3': 'rgba(43, 76, 82, 0.4)', // odysway text
            'primary-light-4': 'rgba(43, 76, 82, 0.2)', // odysway text
            'secondary': 'rgba(219, 102, 68, 1)', // odysway red
            'secondary-light': 'rgba(219, 102, 68, 0.8)', // odysway red
            'secondary-light-2': 'rgba(219, 102, 68, 0.6)', // odysway red
            'secondary-light-3': 'rgba(219, 102, 68, 0.4)', // odysway red
            'secondary-light-4': 'rgba(219, 102, 68, 0.2)', // odysway red
            'tertiary': '#F0B348', // odysway yellow
            'tertiary-light': '#EADFB1', // odysway yellow
            'quaternary': '#2D5843', // odysway green
            'quaternary-light': '#7D9676', // odysway green
            'soft-blush': '#FBF0EC',
            'cream': '#f5f5f0', // banner bg
            'dark': '#3e3e3e', // dark grey usually applied on text
            'yellow': 'rgba(246, 191, 75, 1)',
            // Virer les suivants
            'odysway-1': '#edeff8', // grey-home-bg
            'odysway-2': '#f5f5f5',
            'orange-lighten-1': '#FFA726',
            'white': '#FFFFFF',
            'grey': '#95A5A8',
            'grey-light': '#EAEDEE',
            'grey-darken-2': '#616161',
            'grey-light-2': 'rgba(234, 237, 238, 1)',
          },
          variables: {
            'medium-emphasis-opacity': '1',
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
        rounded: 'xl',
        class: 'subtle-shadow',
      },
      VBtn: {
        color: 'primary',
        elevation: 0,
        rounded: 'default',
      },
      VBtnPrimary: {
        color: 'primary',
        variant: 'text',
        elevation: 0,
      },
      VBtnSecondary: {
        color: 'secondary',
        elevation: 0,
      },
      VSwitch: {
        color: 'primary',
        baseColor: 'grey',
        inset: true,
        hideDetails: true,
      },
      // Fields
      VTextField: {
        variant: 'solo',
        rounded: 'default',
        bgColor: 'grey-light',
        color: 'primary',
        elevation: 0,
        iconColor: 'primary',
        class: ['text-primary'],
        flat: true,
      },
      VAutocomplete: {
        variant: 'solo',
        rounded: 'default',
        bgColor: 'grey-light',
        color: 'primary',
        elevation: 0,
        flat: true,
      },
      VFieldLabel: {
        class: ['text-primary', 'font-weight-bold'],
      },
      VSelect: {
        variant: 'solo',
        rounded: 'default',
        color: 'primary',
        bgColor: 'grey-light',
        iconColor: 'primary',
        flat: true,
      },
      VExpansionPanel: {
        elevation: 0,
        class: ['rounded-md', 'elevation-0'],
      },
    },
  })

  app.vueApp.use(vuetify)
})
