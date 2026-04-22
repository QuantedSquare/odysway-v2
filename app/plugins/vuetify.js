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
            'on-background': 'rgba(43, 76, 82, 1)',
            'surface-panel': '#EAEDEE',
            'on-surface': 'rgba(43, 76, 82, 1)',
            'text': 'rgba(43, 76, 82, 1)',
            'primary-light': 'rgba(43, 76, 82, 0.5)',
            'primary-light-2': 'rgba(43, 76, 82, 0.6)',
            'primary-light-3': 'rgba(43, 76, 82, 0.4)', // text
            'primary-light-4': 'rgba(43, 76, 82, 0.2)', // text
            'secondary': 'rgba(219, 102, 68, 1)', // red
            'secondary-light': '#edb2a1', // red
            'secondary-light-2': '#EB9A82', // red
            'secondary-light-3': 'rgba(219, 102, 68, 0.4)', // red
            'secondary-light-4': '#DB66441A', // red
            'yellow': '#F0B348', // yellow
            'yellow-light': '#EADFB1', // yellow
            'yellow-light-2': 'rgb(254, 248, 237)', // yellow
            'green': '#2D5843', // green
            'green-light': '#7D9676', // green
            'blue': '#237C8C', // blue
            'blue-light': '#9CC5CC', // blue
            'blue-light-2': '#DFE1F1', // blue
            'red': '#DB6644',
            'red-light': '#EB9A82',
            'soft-blush': '#FBF0EC',
            'cream': '#f5f5f0', // banner bg
            'warm': '#FDF6F2', // banner bg
            'dark': '#3e3e3e', // dark grey usually applied on text
            'yellow-rating': 'rgba(246, 191, 75, 1)',
            // Virer les suivants
            'odysway-1': '#edeff8', // grey-home-bg
            'odysway-2': '#f5f5f5',
            'orange-lighten-1': '#FFA726',
            'white': '#FFFFFF',
            'white-light': 'rgba(255, 255, 255, 0.5)',
            // 'grey': '#95A5A8',
            'grey': 'rgb(118, 118, 118)',
            'grey-light': '#EAEDEE',
            'grey-darken-2': '#616161',
            'grey-light-2': 'rgba(234, 236, 238, 1)',
            'grey-light-3': 'rgba(249, 249, 249, 1)',
          },
          variables: {
            'medium-emphasis-opacity': '1',
          },
        },
        backoffice: {
          dark: false,
          colors: {
            'primary': 'rgba(43, 76, 82, 1)',
            'primary-darken-1': '#2563EB',
            'secondary': '#64748B',
            'background': '#F8FAFC',
            'surface': '#FFFFFF',
            'surface-variant': '#F1F5F9',
            'on-background': '#0F172A',
            'on-surface': '#1E293B',
            'success': '#10B981',
            'warning': '#F59E0B',
            'error': '#EF4444',
            'info': '#6366F1',
            'grey': '#94A3B8',
            'grey-light': '#F1F5F9',
          },
          variables: {
            'medium-emphasis-opacity': 0.6,
            'border-color': '#E2E8F0',
            'border-opacity': 1,
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
      VChip: {
        class: 'pt-1 px-2',
        rounded: 'chip',
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
        color: 'secondary',
        baseColor: 'grey',
        inset: true,
        hideDetails: true,
      },
      // Fields
      VTextField: {
        variant: 'solo',
        rounded: 'default',
        density: 'comfortable',
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
        density: 'comfortable',
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
        density: 'comfortable',
      },
      VExpansionPanel: {
        elevation: 0,
        class: ['rounded-md', 'elevation-0'],
      },
    },
  })

  app.vueApp.use(vuetify)
})
