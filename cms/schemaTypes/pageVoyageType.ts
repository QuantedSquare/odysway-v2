import {defineField, defineType} from 'sanity'

export const pageVoyageType = defineType({
  name: 'page_voyage',
  title: 'Page Voyage',
  type: 'document',
  groups: [
    {name: 'buttons', title: 'Boutons'},
    {name: 'sticky_block', title: 'Bloc collant infos voyage (à droite)'},
    {name: 'content_sections', title: 'Sections de Contenu'},
    {name: 'date_sections', title: 'Sections Dates'},
    {name: 'individual_section', title: 'Section Individuelle'},
    {name: 'price_details', title: 'Détails Prix'},
    {name: 'reviews_section', title: 'Section Avis'},
    {name: 'faq_section', title: 'Section FAQ'},
    {name: 'why_section', title: 'Section Pourquoi'},
    {name: 'other_sections', title: 'Autres Sections'},
    {name: 'seo', title: 'SEO'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Page Voyage',
        subtitle: 'Textes pour la page voyage'
      }
    }
  },
  fields: [
    // Buttons
    defineField({
      name: 'shareButton',
      title: 'Bouton Partager',
      type: 'object',
      group: 'buttons',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'icon',
          title: 'Icône',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'photoButton',
      title: 'Bouton Photos',
      type: 'object',
      group: 'buttons',
      fields: [
        defineField({
          name: 'text',
          title: 'Texte',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'icon',
          title: 'Icône',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Sticky Block
    defineField({
      name: 'stickyBlock',
      title: 'Bloc Collant',
      type: 'object',
      group: 'sticky_block',
      fields: [
        defineField({
          name: 'pricePrefix',
          title: 'Préfixe Prix',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'priceSuffix',
          title: 'Suffixe Prix',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'dateText',
          title: 'Texte Dates',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'dateButtonText',
          title: 'Texte Bouton Dates',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'ctaCall',
          title: 'CTA Appel',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'avatar',
              title: 'Avatar',
              type: 'image',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'to',
              title: 'Lien',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }),
        defineField({
          name: 'ctaBottom',
          title: 'CTA Bas',
          type: 'object',
          fields: [
            defineField({
              name: 'list',
              title: 'Liste',
              type: 'array',
              of: [{type: 'string'}],
              validation: Rule => Rule.required()
            })
          ]
        }),
        defineField({
          name: 'privatisationText',
          title: 'Texte Privatisation',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Content Sections
    defineField({
      name: 'authorNote',
      title: 'Note Auteur',
      type: 'object',
      group: 'content_sections',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'experiencesBlock',
      title: 'Bloc Expériences',
      type: 'object',
      group: 'content_sections',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'icon',
          title: 'Icône',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'iconColor',
          title: 'Couleur Icône',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Couleur de Fond',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'programmeBlock',
      title: 'Bloc Programme',
      type: 'object',
      group: 'content_sections',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'badgeColor',
          title: 'Couleur Badge',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'accompanistsTitle',
      title: 'Titre Accompagnateurs',
      type: 'string',
      group: 'content_sections',
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'housingTitle',
      title: 'Titre Hébergement',
      type: 'string',
      group: 'content_sections',
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'housingTypeTitle',
      title: 'Titre Type Hébergement',
      type: 'string',
      group: 'content_sections',
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'housingMoodTitle',
      title: 'Titre Ambiance Hébergement',
      type: 'string',
      group: 'content_sections',
      validation: Rule => Rule.required()
    }),

    // Date Sections
    defineField({
      name: 'dateSections',
      title: 'Sections Dates',
      type: 'object',
      group: 'date_sections',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'pricePrefix',
          title: 'Préfixe Prix',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'priceSuffix',
          title: 'Suffixe Prix',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'bookingButtonText',
          title: 'Texte Bouton Réservation',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'bookingButtonColor',
          title: 'Couleur Bouton Réservation',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'optionButtonText',
          title: 'Texte Bouton Option',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'optionButtonColor',
          title: 'Couleur Bouton Option',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'disabledButtonText',
          title: 'Texte Bouton Désactivé',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'disabledButtonColor',
          title: 'Couleur Bouton Désactivé',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'ctaList',
          title: 'Liste CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'list',
              title: 'Liste',
              type: 'array',
              of: [{type: 'string'}],
              validation: Rule => Rule.required()
            })
          ]
        }),
        defineField({
          name: 'status',
          title: 'Statuts',
          type: 'object',
          fields: [
            defineField({
              name: 'partiallyBooked',
              title: 'Partiellement Réservé',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Titre',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'text',
                  title: 'Texte',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'color',
                  title: 'Couleur',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'fullyBooked',
              title: 'Complet',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Titre',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'text',
                  title: 'Texte',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'color',
                  title: 'Couleur',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'open',
              title: 'Ouvert',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Titre',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'text',
                  title: 'Texte',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'color',
                  title: 'Couleur',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            })
          ]
        })
      ]
    }),

    // Individual Section
    defineField({
      name: 'indivSection',
      title: 'Section Individuelle',
      type: 'object',
      group: 'individual_section',
      fields: [
        defineField({
          name: 'titleOnlyPrivatisationAvailable',
          title: 'Titre Seulement Privatisation',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Couleur de Fond',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'textButton',
          title: 'Texte Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'textButtonDevis',
          title: 'Texte Bouton Devis',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'buttonColor',
          title: 'Couleur Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Price Details Section
    defineField({
      name: 'priceDetailsSection',
      title: 'Section Détails Prix',
      type: 'object',
      group: 'price_details',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'priceInclude',
          title: 'Prix Inclut',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'colorInclude',
          title: 'Couleur Inclut',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'priceExclude',
          title: 'Prix N\'inclut Pas',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'colorExclude',
          title: 'Couleur N\'inclut Pas',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Reviews Section
    defineField({
      name: 'reviewsSection',
      title: 'Section Avis',
      type: 'object',
      group: 'reviews_section',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'ratingColor',
          title: 'Couleur Note',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // FAQ Section
    defineField({
      name: 'faqSection',
      title: 'Section FAQ',
      type: 'object',
      group: 'faq_section',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Couleur de Fond',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'textButton',
          title: 'Texte Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'buttonColor',
          title: 'Couleur Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'to',
          title: 'Lien',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'avatar',
          title: 'Avatar',
          type: 'image',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'subtitle',
          title: 'Sous-titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Why Section
    defineField({
      name: 'whySection',
      title: 'Section Pourquoi',
      type: 'object',
      group: 'why_section',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Couleur de Fond',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'itemBackgroundColor',
          title: 'Couleur de Fond Item',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'list',
          title: 'Liste',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icône',
                  type: 'image',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'text',
                  title: 'Texte',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }
          ],
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Other Sections
    defineField({
      name: 'otherIdeas',
      title: 'Autres Idées',
      type: 'string',
      group: 'other_sections',
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'pageNotFound',
      title: 'Page Non Trouvée',
      type: 'object',
      group: 'other_sections',
      fields: [
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'buttonText',
          title: 'Texte Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'buttonTo',
          title: 'Lien Bouton',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
