import {defineField, defineType} from 'sanity'

export const pageContactType = defineType({
  name: 'page_contact',
  title: 'Page Contact',
  type: 'document',
  groups: [
    {name: 'general', title: 'Général'},
    {name: 'contact_form', title: 'Formulaire de Contact'},
    {name: 'gdpr_section', title: 'Section RGPD'},
    {name: 'validation_messages', title: 'Messages de Validation'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Page Contact',
        subtitle: 'Textes pour la page contact'
      }
    }
  },
  fields: [
    // General
    defineField({
      name: 'formTitle',
      title: 'Titre du formulaire de contact',
      type: 'string',
      group: 'general',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'heroSection',
      title: 'Section Hero',
      type: 'object',
      group: 'general',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre de la section hero',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'teamImageAlt',
          title: 'Texte alternatif de l\'image équipe',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Contact Form
    defineField({
      name: 'contactForm',
      title: 'Formulaire de contact',
      type: 'object',
      group: 'contact_form',
      fields: [
        defineField({
          name: 'fields',
          title: 'Champs du formulaire',
          type: 'object',
          fields: [
            defineField({
              name: 'civility',
              title: 'Champ civilité',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ civilité',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ civilité',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'options',
                  title: 'Options de civilité',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'mr',
                      title: 'Option Monsieur',
                      type: 'string',
                      validation: Rule => Rule.required()
                    }),
                    defineField({
                      name: 'mrs',
                      title: 'Option Madame',
                      type: 'string',
                      validation: Rule => Rule.required()
                    }),
                    defineField({
                      name: 'other',
                      title: 'Option Autre',
                      type: 'string',
                      validation: Rule => Rule.required()
                    })
                  ]
                })
              ]
            }),
            defineField({
              name: 'lastName',
              title: 'Champ nom',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ nom',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ nom',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'firstName',
              title: 'Champ prénom',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ prénom',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ prénom',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'phone',
              title: 'Champ téléphone',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ téléphone',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'email',
              title: 'Champ email',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ email',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ email',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'subject',
              title: 'Champ objet',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ objet',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ objet',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'message',
              title: 'Champ message',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label du champ message',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder du champ message',
                  type: 'string',
                  validation: Rule => Rule.required()
                })
              ]
            })
          ]
        }),
        defineField({
          name: 'submitButton',
          title: 'Texte du bouton soumettre',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'formTitle',
          title: 'Titre du formulaire',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'successMessage',
          title: 'Message de succès après envoi',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'successDescription',
          title: 'Description du message de succès',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // GDPR Section
    defineField({
      name: 'gdprSection',
      title: 'Section RGPD',
      type: 'object',
      group: 'gdpr_section',
      fields: [
        defineField({
          name: 'agreementText',
          title: 'Texte avant le lien',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'privacyLinkText',
          title: 'Texte du lien politique de confidentialité',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'privacyLinkUrl',
          title: 'URL de la politique de confidentialité',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'agreementSuffix',
          title: 'Texte après le lien',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),

    // Validation Messages
    defineField({
      name: 'validationMessages',
      title: 'Messages de validation',
      type: 'object',
      group: 'validation_messages',
      fields: [
        defineField({
          name: 'civilityRequired',
          title: 'Message validation civilité requise',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'fieldRequired',
          title: 'Message validation champ requis',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'invalidEmail',
          title: 'Message validation email invalide',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'minOneCharacter',
          title: 'Message validation un caractère minimum',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'minMessageCharacters',
          title: 'Message validation vingt caractères minimum',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'gdprRequired',
          title: 'Message validation RGPD requis',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
