import {defineField, defineType} from 'sanity'

export const devisType = defineType({
  name: 'devis',
  title: 'Devis',
  type: 'document',
  groups: [
    {name: 'breadcrumb', title: 'Fil d\'Ariane'},
    {name: 'steps', title: 'Étapes'},
    {name: 'calendly', title: 'Calendly'},
    {name: 'buttons', title: 'Boutons'},
    {name: 'form_labels', title: 'Labels Formulaire'},
    {name: 'form_sections', title: 'Sections Formulaire'},
    {name: 'trust_badges', title: 'Badges de confiance'},
    {name: 'options', title: 'Options'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Devis',
        subtitle: 'Textes pour le funnel de demande de devis'
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
          name: 'step_4',
          title: 'Étape 4',
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

    // Steps
    defineField({
      name: 'first_step',
      title: 'Première Étape',
      type: 'object',
      group: 'steps',
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

    defineField({
      name: 'second_step',
      title: 'Deuxième Étape',
      type: 'object',
      group: 'steps',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'sub_1',
          title: 'Sous-titre 1',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'sub_2',
          title: 'Sous-titre 2',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'sub_3',
          title: 'Sous-titre 3',
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
          name: 'comment_title',
          title: 'Titre Commentaire',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'third_step',
      title: 'Troisième Étape',
      type: 'object',
      group: 'steps',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'sub_1',
          title: 'Sous-titre 1',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'sub_2',
          title: 'Sous-titre 2',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Calendly
    defineField({
      name: 'calendly',
      title: 'Informations Calendly',
      type: 'object',
      group: 'calendly',
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
          type: 'text',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Buttons
    defineField({
      name: 'buttons',
      title: 'Textes des boutons',
      type: 'object',
      group: 'buttons',
      fields: [
        defineField({
          name: 'send_devis_request',
          title: 'Texte bouton envoyer demande de devis',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'take_appointment',
          title: 'Texte bouton prendre rendez-vous',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'next',
          title: 'Texte bouton suivant',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'previous',
          title: 'Texte bouton précédent',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'return_to_voyages',
          title: 'Texte bouton retourner aux voyages',
          type: 'string'
        }),
        defineField({
          name: 'send_form_button',
          title: 'Texte bouton envoyer le formulaire',
          type: 'string'
        })
      ]
    }),

    // Form Labels
    defineField({
      name: 'form_labels',
      title: 'Labels des champs de formulaire',
      type: 'object',
      group: 'form_labels',
      fields: [
        defineField({
          name: 'nb_adults',
          title: 'Label nombre d\'adultes',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'nb_children',
          title: 'Label nombre d\'enfants',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'select_period',
          title: 'Label sélectionner période',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'date_placeholder',
          title: 'Placeholder format de date',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'departure_airport_question',
          title: 'Question aéroport de départ',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'departure_airport_label',
          title: 'Label aéroport de départ',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'firstname',
          title: 'Label prénom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'lastname',
          title: 'Label nom',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'email',
          title: 'Label email',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Form Sections
    defineField({
      name: 'form_sections',
      title: 'Sections du formulaire',
      type: 'object',
      group: 'form_sections',
      fields: [
        defineField({ name: 'coordinates_title', title: 'Titre section coordonnées', type: 'string' }),
        defineField({ name: 'project_title', title: 'Titre section votre projet', type: 'string' }),
        defineField({ name: 'privacy_text', title: 'Texte politique de confidentialité', type: 'text', rows: 3 }),
        defineField({ name: 'privacy_link_text', title: 'Texte lien politique', type: 'string' }),
        defineField({ name: 'no_data_sold_text', title: 'Texte données non revendues', type: 'string' }),
        defineField({ name: 'no_commitment_badge', title: 'Badge sans engagement', type: 'string' }),
        defineField({ name: 'message_optional_label', title: 'Label optionnel', type: 'string' }),
        defineField({ name: 'message_placeholder', title: 'Placeholder message', type: 'text', rows: 3 }),
        defineField({ name: 'flight_yes_label', title: 'Label Oui (vol)', type: 'string' }),
        defineField({ name: 'flight_no_label', title: 'Label Non (vol)', type: 'string' })
      ]
    }),

    // Trust Badges
    defineField({
      name: 'trust_badges',
      title: 'Badges de confiance',
      type: 'object',
      group: 'trust_badges',
      fields: [
        defineField({ name: 'rating_text', title: 'Texte note Google', type: 'string' }),
        defineField({ name: 'cancellation_text', title: 'Texte annulation gratuite', type: 'string' }),
        defineField({ name: 'advisor_text', title: 'Texte conseillère dédiée', type: 'string' }),
        defineField({ name: 'starting_price_label', title: 'Label tarif indicatif à partir de', type: 'string' }),
        defineField({ name: 'price_per_person_suffix', title: 'Suffixe prix par personne', type: 'string' })
      ]
    }),

    // Options
    defineField({
      name: 'options',
      title: 'Options génériques',
      type: 'object',
      group: 'options',
      fields: [
        defineField({
          name: 'yes',
          title: 'Option Oui',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'no',
          title: 'Option Non',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
