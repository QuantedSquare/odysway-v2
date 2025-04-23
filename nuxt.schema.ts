import { field, group } from '@nuxt/content/preview'

export default defineNuxtSchema({
  appConfig: {
    ui: group({
      title: 'UI',
      description: 'UI Customization.',
      icon: 'i-mdi-palette-outline',
      fields: {
        colors: group({
          title: 'Colors',
          description: 'Manage main colors of your application',
          icon: 'i-mdi-palette-outline',
          fields: {
            primary: field({
              type: 'string',
              title: 'Primary',
              description: 'Primary color of your UI.',
              icon: 'i-mdi-palette-outline',
              default: 'green',
              required: ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'],
            }),
            neutral: field({
              type: 'string',
              title: 'Neutral',
              description: 'Neutral color of your UI.',
              icon: 'i-mdi-palette-outline',
              default: 'slate',
              required: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
            }),
          },
        }),
        icons: group({
          title: 'Icons',
          description: 'Manage icons used in the application.',
          icon: 'i-mdi-application-settings-outline',
          fields: {
            search: field({
              type: 'icon',
              title: 'Search Bar',
              description: 'Icon to display in the search bar.',
              icon: 'i-mdi-magnify',
              default: 'i-lucide-search',
            }),
            dark: field({
              type: 'icon',
              title: 'Dark mode',
              description: 'Icon of color mode button for dark mode.',
              icon: 'i-mdi-moon-waning-crescent',
              default: 'i-lucide-moon',
            }),
            light: field({
              type: 'icon',
              title: 'Light mode',
              description: 'Icon of color mode button for light mode.',
              icon: 'i-mdi-white-balance-sunny',
              default: 'i-lucide-sun',
            }),
            external: field({
              type: 'icon',
              title: 'External Link',
              description: 'Icon for external link.',
              icon: 'i-mdi-arrow-top-right',
              default: 'i-lucide-external-link',
            }),
            chevron: field({
              type: 'icon',
              title: 'Chevron',
              description: 'Icon for chevron.',
              icon: 'i-mdi-chevron-down',
              default: 'i-lucide-chevron-down',
            }),
            hash: field({
              type: 'icon',
              title: 'Hash',
              description: 'Icon for hash anchors.',
              icon: 'i-ph-hash',
              default: 'i-lucide-hash',
            }),
          },
        }),
      },
    }),
    seo: group({
      title: 'SEO',
      description: 'SEO configuration.',
      icon: 'i-ph-app-window',
      fields: {
        siteName: field({
          type: 'string',
          title: 'Site Name',
          description: 'Name used in ogSiteName and used as second part of your page title (My page title - Nuxt UI Pro).',
          icon: 'i-mdi-web',
          default: [],
        }),
      },
    }),
    header: group({
      title: 'Header',
      description: 'Header configuration.',
      icon: 'i-mdi-page-layout-header',
      fields: {
        title: field({
          type: 'string',
          title: 'Title',
          description: 'Title to display in the header.',
          icon: 'i-mdi-format-title',
          default: '',
        }),
        to: field({
          type: 'string',
          title: 'To',
          description: 'URL to redirect to when the title is clicked.',
          icon: 'i-mdi-link-variant',
          default: '',
        }),
        logo: group({
          title: 'Logo',
          description: 'Header logo configuration.',
          icon: 'i-mdi-image-filter-center-focus-strong-outline',
          fields: {
            light: field({
              type: 'media',
              title: 'Light Mode Logo',
              description: 'Pick an image from your gallery.',
              icon: 'i-mdi-white-balance-sunny',
              default: '',
            }),
            dark: field({
              type: 'media',
              title: 'Dark Mode Logo',
              description: 'Pick an image from your gallery.',
              icon: 'i-mdi-moon-waning-crescent',
              default: '',
            }),
            alt: field({
              type: 'string',
              title: 'Alt',
              description: 'Alt to display for accessibility.',
              icon: 'i-mdi-alphabet-latin',
              default: '',
            }),
          },
        }),
        search: field({
          type: 'boolean',
          title: 'Search Bar',
          description: 'Hide or display the search bar.',
          icon: 'i-mdi-magnify',
          default: true,
        }),
        colorMode: field({
          type: 'boolean',
          title: 'Color Mode',
          description: 'Hide or display the color mode button in your header.',
          icon: 'i-mdi-moon-waning-crescent',
          default: true,
        }),
        links: field({
          type: 'array',
          title: 'Links',
          description: 'Array of link object displayed in header.',
          icon: 'i-mdi-link-variant',
          default: [],
        }),
      },
    }),
    footer: group({
      title: 'Footer',
      description: 'Configuration du Footer',
      icon: 'i-mdi-page-layout-footer',
      fields: {
        logo: group({
          title: 'Logo',
          description: 'Section Logo et description',
          icon: 'i-mdi-image-filter-center-focus-strong-outline',
          fields: {
            image: field({
              type: 'media',
              title: 'Logo Odysway',
              description: 'Logo Odysway',
              icon: 'i-mdi-white-balance-sunny',
              default: '',
            }),
            description: field({
              type: 'string',
              title: 'Description',
              description: 'Description de Odysway placé sous le Logo',
              icon: 'i-mdi-alphabet-latin',
              default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna sed tortor nullam.',
            }),
          },
        }),
        team: group({
          title: 'Team',
          description: 'Section Team',
          icon: 'i-mdi-account-group',
          fields: {
            image: field({
              type: 'media',
              title: 'Photo l\'équipe Odysway',
              description: 'Photo de groupe de l\'équipe',
              icon: 'i-mdi-white-balance-sunny',
              default: '/team-photo.webp',
            }),
          },
        }),
        contact: group({
          title: 'Contact',
          description: 'Contact information and social links',
          icon: 'i-mdi-contact-mail',
          fields: {
            ctaText: field({
              type: 'string',
              title: 'Contact texte',
              description: 'Texte au dessus des informations de contact',
              icon: 'i-mdi-text-box-plus-outline',
              default: 'N\'hésitez pas à nous contacter',
            }),
            phone: field({
              type: 'string',
              title: 'Phone',
              description: 'Phone of Odysway',
              icon: 'i-mdi-phone',
              default: '01 23 45 67 89',
            }),
            email: field({
              type: 'string',
              title: 'Email',
              description: 'Email of Odysway',
              icon: 'i-mdi-email',
              default: 'contact@odysway.com',
            }),
            buttonContact: group({
              title: 'Contact',
              description: 'Contact information and social links',
              icon: 'i-mdi-button-contact',
              fields: {
                text: field({
                  type: 'string',
                  title: 'Texte du bouton',
                  description: 'Texte du bouton',
                  icon: 'i-mdi-text-box-plus-outline',
                }),
                lien: field({
                  type: 'string',
                  title: 'lien',
                  description: 'URL de redirection au click du bouton',
                  default: '/calendly',
                  icon: 'i-mdi-link-variant',
                }),
              },
            }),
          },
        }),
        social: group({
          title: 'Social Media',
          description: 'Social media links',
          fields: {
            facebook: field({
              type: 'string',
              title: 'Facebook',
              default: '',
            }),
            instagram: field({
              type: 'string',
              title: 'Instagram',
              default: '',
            }),
            tiktok: field({
              type: 'string',
              title: 'TikTok',
              default: '',
            }),
          },
        }),
        linksList: group({
          title: 'Links List',
          description: 'Links list',
          icon: 'i-mdi-link-variant',
          fields: {
            colonne1: group({
              title: 'Colonne 1',
              description: 'Colonne 1',
              icon: 'i-mdi-link-variant',
              fields: {
                title: field({
                  type: 'string',
                  title: 'Titre',
                  description: 'Titre de la colonne',
                  icon: 'i-mdi-title',
                  default: 'Liens utiles',
                }),
                links: field({
                  type: 'array',
                  title: 'Links',
                  description: 'Array of link object displayed in footer.',
                  icon: 'i-mdi-link-variant',
                  default: [],
                }),
              },
            }),
            colonne2: group({
              title: 'Colonne 2',
              description: 'Colonne 2',
              icon: 'i-mdi-link-variant',
              fields: {
                title: field({
                  type: 'string',
                  title: 'Titre',
                  description: 'Titre de la colonne',
                  icon: 'i-mdi-title',
                  default: 'Destinations',
                }),
                links: field({
                  type: 'array',
                  title: 'Links',
                  description: 'Array of link object displayed in footer.',
                  icon: 'i-mdi-link-variant',
                  default: [],
                }),
              },
            }),
          },
        }),
      },
    }),
  },
})
//   interface CustomAppConfig {
//     ui: {
//       icons: object
//     }
//   }
// }
