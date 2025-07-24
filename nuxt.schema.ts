import { field, group } from '@nuxt/content/preview'

export default defineNuxtSchema({
  appConfig: {
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
        to: field({
          type: 'string',
          title: 'To',
          description: 'Url de redirection lors du click sur le titre',
          icon: 'i-mdi-link-variant',
          default: '/',
        }),
        logo: group({
          title: 'Logo',
          description: 'Logo Odysway en haut à gauche',
          icon: 'i-mdi-image-filter-center-focus-strong-outline',
          fields: {
            desktop: field({
              type: 'media',
              title: 'Logo sur grand écran',
              description: 'Logo sur grand écran',
              icon: 'i-mdi-white-balance-sunny',
              default: '/logos/Logo-Odysway-Bleu.png',
            }),
            mobile: field({
              type: 'media',
              title: 'Logo sur téléphone',
              description: 'Logo sur téléphone',
              icon: 'i-mdi-moon-waning-crescent',
              default: '/logos/Logo-Odysway-Bleu.png',
            }),
            alt: field({
              type: 'string',
              title: 'Alt',
              description: 'Texte alternatif pour l\'image',
              icon: 'i-mdi-alphabet-latin',
              default: 'Logo Odysway',
            }),
          },
        }),
        textButton1: field({
          type: 'string',
          title: 'Texte du bouton gauche',
          description: 'Texte du bouton gauche',
          icon: 'i-mdi-text-box-plus-outline',
          default: 'Nos voyages',
        }),
        textButton2: field({
          type: 'string',
          title: 'Texte du bouton 2',
          description: 'Texte du bouton 2',
          icon: 'i-mdi-text-box-plus-outline',
          default: 'Notre vision du voyage',
        }),
        textButton3: field({
          type: 'string',
          title: 'Texte du bouton 3',
          description: 'Texte du bouton 3',
          icon: 'i-mdi-text-box-plus-outline',
          default: '01 00 00 00 00',
        }),
        textButton4: field({
          type: 'string',
          title: 'Texte du bouton droit',
          description: 'Texte du bouton droit',
          icon: 'i-mdi-text-box-plus-outline',
          default: 'Faisons connaissance!',
        }),
        search: field({
          type: 'boolean',
          title: 'Search Bar',
          description: 'Afficher ou masquer la barre de recherche.',
          icon: 'i-mdi-magnify',
          default: false,
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
                links: group({
                  title: 'Links',
                  description: 'Array of link object displayed in footer.',
                  icon: 'i-mdi-link-variant',
                  fields: {
                    link1: group({
                      title: 'Link 1',
                      description: 'Link 1',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link2: group({
                      title: 'Link 2',
                      description: 'Link 2',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link3: group({
                      title: 'Link 3',
                      description: 'Link 3',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                  },
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
                  default: 'Liens utiles',
                }),
                links: group({
                  title: 'Links',
                  description: 'Array of link object displayed in footer.',
                  icon: 'i-mdi-link-variant',
                  fields: {
                    link1: group({
                      title: 'Link 1',
                      description: 'Link 1',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link2: group({
                      title: 'Link 2',
                      description: 'Link 2',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link3: group({
                      title: 'Link 3',
                      description: 'Link 3',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                  },
                }),
              },
            }),
            colonne3: group({
              title: 'Colonne 3',
              description: 'Colonne 2',
              icon: 'i-mdi-link-variant',
              fields: {
                title: field({
                  type: 'string',
                  title: 'Titre',
                  description: 'Titre de la colonne',
                  icon: 'i-mdi-title',
                  default: 'Liens utiles',
                }),
                links: group({
                  title: 'Links',
                  description: 'Array of link object displayed in footer.',
                  icon: 'i-mdi-link-variant',
                  fields: {
                    link1: group({
                      title: 'Link 1',
                      description: 'Link 1',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link2: group({
                      title: 'Link 2',
                      description: 'Link 2',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                    link3: group({
                      title: 'Link 3',
                      description: 'Link 3',
                      icon: 'i-mdi-link-variant',
                      fields: {
                        text: field({
                          type: 'string',
                          title: 'Text',
                          description: 'Texte du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                        link: field({
                          type: 'string',
                          title: 'Link',
                          description: 'URL de redirection au click du bouton',
                          icon: 'i-mdi-link-variant',
                        }),
                      },
                    }),
                  },
                }),
              },
            }),
            ccolonne4: group({
              title: 'Où nous trouver',
              description: 'Adresse et coordonnées',
              icon: 'i-mdi-link-variant',
              fields: {
                title: field({
                  type: 'string',
                  title: 'Titre',
                  description: 'Titre de la colonne',
                  icon: 'i-mdi-title',
                  default: 'Où nous trouver',
                }),
                name: field({
                  type: 'string',
                  title: 'Nom',
                  description: 'Nom de la société',
                  icon: 'i-mdi-title',
                  default: 'Odysway',
                }),
                address: field({
                  type: 'string',
                  title: 'Titre',
                  description: 'Numéro de rue, rue',
                  icon: 'i-mdi-title',
                  default: '40 Rue du Louvre,',
                }),
                city: field({
                  type: 'string',
                  title: 'Ville',
                  description: 'Ville, code postal, pays',
                  icon: 'i-mdi-title',
                  default: 'Paris, France',
                }),
              },
            }),
          },
        }),
      },
    }),
  },
})
