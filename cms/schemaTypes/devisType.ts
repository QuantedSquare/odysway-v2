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
