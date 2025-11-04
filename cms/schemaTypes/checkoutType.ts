import {defineField, defineType} from 'sanity'

const richTextBlock = {
  type: 'block',
  title: 'Bloc de texte',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'H2', value: 'h2'},
    {title: 'H3', value: 'h3'},
    {title: 'H4', value: 'h4'},
    {title: 'Citation', value: 'blockquote'},
  ],
  marks: {
    decorators: [
      {title: 'Gras', value: 'strong'},
      {title: 'Italique', value: 'em'},
      {title: 'Souligné', value: 'underline'},
      {title: 'Barré', value: 'strike-through'},
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Lien',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: (rule: any) => rule.uri({
              scheme: ['http', 'https', 'mailto']
            })
          },
        ],
      },
    ],
  },
  lists: [
    {title: 'Puces', value: 'bullet'},
    {title: 'Numéroté', value: 'number'},
  ],
}

export const checkoutType = defineType({
  name: 'checkout',
  title: 'Checkout',
  type: 'document',
  groups: [
    {name: 'breadcrumb', title: 'Fil d\'Ariane'},
    {name: 'first_step', title: 'Première Étape'},
    {name: 'general', title: 'Général'},
    {name: 'details', title: 'Détails'},
    {name: 'travelers_infos', title: 'Infos Voyageurs'},
    {name: 'options', title: 'Options'},
    {name: 'insurances', title: 'Assurances'},
    {name: 'summary', title: 'Résumé'},
    {name: 'dialogs', title: 'Dialogs'},
    {name: 'payment', title: 'Paiement'},
    {name: 'navigation', title: 'Navigation'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Checkout',
        subtitle: 'Textes pour le processus de checkout'
      }
    }
  },
  fields: [
    // Breadcrumb
    defineField({
      name: 'fil_dariane_devis',
      title: 'Fil d\'Ariane Devis',
      type: 'object',
      group: 'breadcrumb',
      fields: [
        defineField({
          name: 'step_1',
          title: 'Étape 1',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'step_2',
          title: 'Étape 2',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'step_3',
          title: 'Étape 3',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'step_final_rdv',
          title: 'Étape Finale RDV',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // First Step
    defineField({
      name: 'first_step',
      title: 'Première Étape',
      type: 'object',
      group: 'first_step',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'option_1',
          title: 'Option 1',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'option_2',
          title: 'Option 2',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'option_3',
          title: 'Option 3',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // General
    defineField({
      name: 'image_checkout',
      type: 'image',
      options: {hotspot: true},
      group: 'general',
      fields: [{name: 'alt', type: 'string'} as any],
      title: 'Image Voyage sans image',
    }),
    defineField({
      name: 'calendly',
      title: 'Texte Calendly',
      type: 'text',
      rows: 3,
      group: 'general',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'room_indiv_accroche',
      title: 'Accroche Chambre Individuelle',
      type: 'text',
      rows: 3,
      group: 'general',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'room_indiv_text',
      title: 'Texte Chambre Individuelle',
      type: 'text',
      rows: 3,
      group: 'general',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'forced_indiv_room_text',
      title: 'Texte Chambre Individuelle Forcée',
      type: 'text',
      rows: 3,
      group: 'general'
    }),
    defineField({
      name: 'cancel_text',
      title: 'Texte d\'Annulation',
      type: 'text',
      group: 'general',
      rows: 3,
      validation: Rule => Rule.required()
    }),

    // Details
    defineField({
      name: 'details',
      title: 'Détails',
      type: 'object',
      group: 'details',
      fields: [
        defineField({
          name: 'select_travelers_title',
          title: 'Titre Sélection Voyageurs',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'nb_travelers_title',
          title: 'Titre Nombre Voyageurs',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'nb_adults_label',
          title: 'Label Nombre Adultes',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'nb_children_label',
          title: 'Label Nombre Enfants',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'contact_title',
          title: 'Titre Contact',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'firstname_label',
          title: 'Label Prénom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'lastname_label',
          title: 'Label Nom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'email_label',
          title: 'Label Email',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'firstname_placeholder',
          title: 'Placeholder Prénom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'lastname_placeholder',
          title: 'Placeholder Nom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'email_placeholder',
          title: 'Placeholder Email',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'newsletter_text',
          title: 'Texte Newsletter',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'newsletter_label',
          title: 'Label Newsletter',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Travelers Infos
    defineField({
      name: 'travelers_infos',
      title: 'Infos Voyageurs',
      type: 'object',
      group: 'travelers_infos',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'alert',
          title: 'Alerte',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'all_fields_required',
          title: 'Tous Champs Requis',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'age_validation',
          title: 'Validation Âge',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'preference_couple',
          title: 'Préférence Couple',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Options
    defineField({
      name: 'options',
      title: 'Options',
      type: 'object',
      group: 'options',
      fields: [
        defineField({
          name: 'room_indiv_title',
          title: 'Titre Chambre Individuelle',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'indiv_room_label',
          title: 'Label Chambre Individuelle',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'food_details_title',
          title: 'Titre Détails Alimentaires',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'food_prefs_label',
          title: 'Label Préférences Alimentaires',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'vege_label',
          title: 'Label Végétarien',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'vege_sub_label',
          title: 'Sous-label Végétarien',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'other_food_label',
          title: 'Label Autres Demandes',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'special_request_label',
          title: 'Label Demande Spéciale',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Insurances
    defineField({
      name: 'insurances',
      title: 'Assurances',
      type: 'object',
      group: 'insurances',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'no_insurance_label',
          title: 'Label Pas d\'Assurance',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'alert',
          title: 'Alerte',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'unavailable',
          title: 'Indisponible',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'conseille_badge',
          title: 'Badge Conseillé',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'assurance_img',
          title: 'Image Assurance',
          type: 'image',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'accroche_assurance_perou_nepal',
          title: 'Accroche Assurance Pérou/Népal',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'details_assurance_medicale_perou_nepal',
          title: 'Détails Assurance Médicale Pérou/Népal',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'preference_assurance_annulation',
          title: 'Préférence Assurance Annulation',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'accroche_assurance_annulation',
          title: 'Accroche Assurance Annulation',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'details_assurance_annulation',
          title: 'Détails Assurance Annulation',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'preference_assurance_multirisque',
          title: 'Préférence Assurance Multirisque',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'accroche_assurance_medicale',
          title: 'Accroche Assurance Médicale',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'details_assurance_medicale',
          title: 'Détails Assurance Médicale',
          type: 'array',
          of: [richTextBlock]
        }),
        defineField({
          name: 'insurances_unavailable',
          title: 'Assurances Indisponibles',
          type: 'string'
        })
      ]
    }),

    // Summary
    defineField({
      name: 'summary',
      title: 'Résumé',
      type: 'object',
      group: 'summary',
      fields: [
        defineField({
          name: 'dates_confirmed',
          title: 'Dates Confirmées',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'base_price',
          title: 'Prix de Base',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'extension_price',
          title: 'Prix Extension',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'travelers_details',
          title: 'Détails Voyageurs',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'total_discount',
          title: 'Réduction Totale',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'already_paid',
          title: 'Déjà Payé',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'total_price',
          title: 'Prix Total',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'deposit_due',
          title: 'Accompte à Régler',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'balance_due',
          title: 'Solde à Régler',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'amount_due',
          title: 'Montant à Régler',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'already_paid_full',
          title: 'Déjà Payé Intégralement',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'full_payment_required',
          title: 'Paiement Intégral Requis',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'cancel_text',
          title: 'Texte d\'Annulation',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'forced_indiv_room_text',
          title: 'Texte Chambre Individuelle Forcée',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'options_title',
          title: 'Titre Options',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'early_bird_badge',
          title: 'Badge EarlyBird',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'last_minute_badge',
          title: 'Badge LastMinute',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Dialogs
    defineField({
      name: 'dialogs',
      title: 'Dialogs',
      type: 'object',
      group: 'dialogs',
      fields: [
        defineField({
          name: 'learn_more_btn',
          title: 'Bouton En Savoir Plus',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'learn_more_title',
          title: 'Titre En Savoir Plus',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Payment
    defineField({
      name: 'payment',
      title: 'Paiement',
      type: 'object',
      group: 'payment',
      fields: [
        defineField({
          name: 'phrase_dacceptation',
          title: 'Phrase d\'Acceptation',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'ask_for_option_text',
          title: 'Texte Demande Option',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'accept_country_conditions_text',
          title: 'Texte Acceptation Conditions Pays',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'option_already_placed_error',
          title: 'Erreur Option Déjà Posée',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'place_option_button',
          title: 'Bouton Poser Option',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'pay_stripe_button',
          title: 'Bouton Payer Stripe',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'pay_alma_button',
          title: 'Bouton Payer Alma',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'alma_payment_info',
          title: 'Info Paiement Alma',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Navigation
    defineField({
      name: 'navigation',
      title: 'Navigation',
      type: 'object',
      group: 'navigation',
      fields: [
        defineField({
          name: 'next_button',
          title: 'Bouton Suivant',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'prev_button',
          title: 'Bouton Précédent',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
