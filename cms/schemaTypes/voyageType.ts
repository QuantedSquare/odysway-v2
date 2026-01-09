import { defineField, defineType } from 'sanity'
import BmsLink from './components/BmsLink'

const richTextBlock = {
  type: 'block',
  title: 'Bloc de texte',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'H4', value: 'h4' },
    { title: 'Citation', value: 'blockquote' },
  ],
  marks: {
    decorators: [
      { title: 'Gras', value: 'strong' },
      { title: 'Italique', value: 'em' },
      { title: 'Souligné', value: 'underline' },
      { title: 'Barré', value: 'strike-through' },
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
            validation: (rule: any) =>
              rule.uri({
                scheme: ['http', 'https', 'mailto', 'tel'],
              }),
          },
        ],
      },
    ],
  },
  lists: [
    { title: 'Puces', value: 'bullet' },
    { title: 'Numéroté', value: 'number' },
  ],
}

export const voyageType = defineType({
  name: 'voyage',
  title: 'Voyage',
  type: 'document',
  groups: [
    { name: 'requiredBMS', title: 'Champs requis pour une Date' },
    { name: 'requiredTravelPage', title: 'Champs requis pour afficher la page Voyage' },
    { name: 'basic', title: 'Informations de Base' },
    { name: 'photoGallery', title: 'Galerie de Photos' },
    { name: 'voyageDescription', title: 'Déscriptions du voyage' },
    { name: 'badges', title: 'Badges' },
    { name: 'availability', title: 'Disponibilités par Mois' },
    { name: 'perfectPeriods', title: 'Périodes Idéales' },
    { name: 'pricing', title: 'Informations sur le prix' },
    { name: 'accompanists', title: 'Accompagnants' },
    { name: 'programme', title: 'Programme' },
    { name: 'housing', title: 'Hébergement' },
    { name: 'faq', title: 'FAQ' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'bmsLink',
      type: 'url',
      hidden: ({ document }) => {
        const doc = document as any
        return !doc?._id || doc._id.startsWith('drafts.') || !doc?.slug?.current
      },
      readOnly: true,
      components: { input: BmsLink } as any,
      group: ['requiredBMS', 'basic'],
      title: 'Lien BMS',
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required().min(1),
      group: ['requiredBMS', 'basic'],
      title: 'Titre du voyage',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
      group: ['requiredBMS', 'basic'],
      title: 'Slug du voyage',
    }),
    defineField({
      name: 'destinations',
      title: 'Destinations',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'destination' }],
        options: {
          aiAssist: {
            embeddingsIndex: 'all-document-index'
          }
        }
      }],
      validation: (r) => r.required().min(1),
      group: ['basic', 'requiredBMS'],
    }),
    defineField({
      name: 'availabilityTypes',
      type: 'array',
      title: 'Types de disponibilité',
      description: 'Sélectionnez les types de voyage disponibles',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Voyage en groupe', value: 'groupe' },
          { title: 'Voyage en privatisation', value: 'privatisation' },
          { title: 'Voyage sur-mesure', value: 'custom' },
        ],
        layout: 'grid',
      },
      validation: (r) => r.required().min(1),
      group: ['requiredBMS', 'basic'],
    }),
    defineField({
      name: 'groupeAvailable',
      type: 'boolean',
      group: 'basic',
      title: 'Voyage disponible en groupe (Legacy)',
      description: 'Ancien champ - À migrer vers availabilityTypes',
      hidden: true,
      initialValue: false,
    }),
    defineField({
      name: 'privatisationAvailable',
      type: 'boolean',
      group: 'basic',
      title: 'Voyage disponible en privatisation (Legacy)',
      description: 'Ancien champ - À migrer vers availabilityTypes',
      hidden: true,
      initialValue: false,
    }),
    defineField({
      name: 'customAvailable',
      type: 'boolean',
      group: 'basic',
      title: 'Voyage disponible en sur-mesure (Legacy)',
      description: 'Ancien champ - À migrer vers availabilityTypes',
      hidden: true,
      initialValue: false,
    }),
    defineField({
      name: 'difficultyLevel',
      type: 'reference',
      to: [{ type: 'difficultyLevel' }],
      options: {
        aiAssist: {
          embeddingsIndex: 'all-document-index'
        }
      },
      title: 'Niveau de difficulté',
      group: 'basic',
    }),
    defineField({
      name: 'level',
      type: 'string',
      group: 'basic',
      title: 'Niveau de difficulté (Legacy)',
      description: 'Ancien champ - À migrer vers difficultyLevel',
      hidden: true,
    }),
    defineField({ name: 'duration', type: 'number', group: 'basic', title: 'Durée du voyage', hidden: true }),
    defineField({ name: 'nights', type: 'number', group: 'basic', title: 'Nombre de nuits', hidden: true }),
    defineField({
      name: 'includeFlight',
      type: 'boolean',
      group: 'basic',
      title: 'Voyage inclut un vol',
      hidden: true,
    }),
    defineField({ name: 'rating', type: 'number', group: 'basic', title: 'Note moyenne' }),
    defineField({
      name: 'comments',
      type: 'number',
      group: 'basic',
      title: 'Nombre de commentaires',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      group: 'basic',
      fields: [{ name: 'alt', type: 'string' } as any],
      title: 'Image principale',
      description: 'Ratio 16:9 (1920x1080 px)',
    }),
    defineField({
      name: 'imageSecondary',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      group: 'basic',
      fields: [{ name: 'alt', type: 'string' } as any],
      title: 'Image secondaire',
      description: 'Ratio 16:9 (1920x1080 px)'
    }),

    defineField({
      name: 'experienceType',
      title: 'Experiences',
      type: 'reference',
      to: [{ type: 'experience' }],
      options: {
        aiAssist: {
          embeddingsIndex: 'all-document-index'
        }
      },
      group: 'basic',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{
        type: 'reference', to: [{ type: 'category' }], options: {
          aiAssist: {
            embeddingsIndex: 'all-document-index'
          }
        }
      }],
      group: 'basic',
    }),
    defineField({
      name: 'monthlyAvailability',
      type: 'array',
      title: 'Disponibilités par mois',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Toutes périodes', value: 'toutePeriodes' },
          { title: 'Janvier', value: 'janvier' },
          { title: 'Février', value: 'fevrier' },
          { title: 'Mars', value: 'mars' },
          { title: 'Avril', value: 'avril' },
          { title: 'Mai', value: 'mai' },
          { title: 'Juin', value: 'juin' },
          { title: 'Juillet', value: 'juillet' },
          { title: 'Août', value: 'aout' },
          { title: 'Septembre', value: 'septembre' },
          { title: 'Octobre', value: 'octobre' },
          { title: 'Novembre', value: 'novembre' },
          { title: 'Décembre', value: 'decembre' },
        ],
        layout: 'grid',
      },
      group: 'availability',
    }),
    defineField({
      name: 'authorNote',
      type: 'object',
      title: "Note de l'auteur",
      group: 'voyageDescription',
      fields: [
        { name: 'text', type: 'array', of: [richTextBlock] },
        {
          name: 'author', type: 'reference', to: [{ type: 'teamMember' }], options: {
            aiAssist: {
              embeddingsIndex: 'all-document-index'
            }
          }
        },
        { name: 'affixeAuthor', type: 'string' },
      ],
    }),
    defineField({
      name: 'experiencesBlock',
      type: 'array',
      of: [richTextBlock],
      group: 'voyageDescription',
      title: 'Plus du voyage',
    }),
    defineField({
      name: 'description',
      type: 'text',
      group: 'voyageDescription',
      title: 'Description du voyage',
    }),
    defineField({
      name: 'emailDescription',
      type: 'text',
      group: 'voyageDescription',
      title: 'Description email',
    }),
    defineField({
      name: 'badges',
      type: 'array',
      title: 'Badges du voyage',
      description: 'Sélectionnez et personnalisez les badges pour ce voyage',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'badge',
              type: 'reference',
              to: [{ type: 'badge' }],
              title: 'Badge',
              validation: (rule: any) => rule.required(),
            } as any,
            {
              name: 'variable1Value',
              type: 'string',
              title: 'Variable 1 (optionnel)',
              description: 'Remplace {var1} dans le texte du badge (ex: "2", "10", "Paris", etc.)',
            } as any,
            {
              name: 'variable2Value',
              type: 'string',
              title: 'Variable 2 (optionnel)',
              description: 'Remplace {var2} dans le texte du badge (ex: "6", "15", "Lyon", etc.)',
            } as any,
            {
              name: 'overrideText',
              type: 'string',
              title: 'Remplacer complètement le texte (optionnel)',
              description: 'Remplace entièrement le texte du badge (utiliser uniquement en cas exceptionnel)',
            } as any,
          ],
          preview: {
            select: {
              badgeText: 'badge.text',
              badgePicto: 'badge.picto',
              variable1Value: 'variable1Value',
              variable2Value: 'variable2Value',
              overrideText: 'overrideText',
            },
            prepare({ badgeText, badgePicto, variable1Value, variable2Value, overrideText }: any) {
              // Priority: overrideText > variable replacement > default badge text
              let displayText = badgeText || 'Badge'

              if (overrideText) {
                displayText = overrideText
              } else if (badgeText) {
                // Replace variables
                if (variable1Value) {
                  displayText = displayText.replace(/\{var1\}/g, variable1Value)
                }
                if (variable2Value) {
                  displayText = displayText.replace(/\{var2\}/g, variable2Value)
                }
              }

              // Build subtitle
              let subtitle = 'Badge standard'
              if (overrideText) {
                subtitle = 'Texte personnalisé'
              } else if (variable1Value || variable2Value) {
                const vars = [variable1Value, variable2Value].filter(Boolean).join(', ')
                subtitle = `Variables: ${vars}`
              }

              return {
                title: displayText,
                subtitle,
                media: badgePicto,
              }
            },
          },
        },
      ],
      group: 'badges',
    }),
    defineField({
      name: 'programmeBlock',
      type: 'array',
      group: 'programme',
      title: 'Bloc programme',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' } as any,
            { name: 'badgeText', type: 'string' } as any,
            { name: 'description', title: 'Description de la journée', type: 'array', of: [richTextBlock] } as any,
            {
              name: 'photo', type: 'image', options: {
                hotspot: true, aiAssist: {
                  imageDescriptionField: 'alt',
                },
              }
            } as any,
            { name: 'denivellation', title: 'Denivellation', type: 'string' } as any,
            { name: 'road', title: 'Description du temps de trajet', type: 'string' } as any,
            { name: 'night', title: 'Description de la nuitée', type: 'string' } as any,
          ],
        },
      ],
    }),
    defineField({
      name: 'pricingDetailsBlock',
      type: 'object',
      group: 'pricing',
      title: 'Détails du prix',
      fields: [
        { name: 'listInclude', type: 'array', title: 'Ce qui est inclus', of: [richTextBlock] } as any,
        { name: 'listExclude', type: 'array', title: 'Ce qui est exclus', of: [richTextBlock] } as any,
      ],
    }),
    defineField({
      name: 'closingDays',
      type: 'number',
      group: ['pricing', 'requiredBMS'],
      title: 'Nombre de jours de fermeture des dates (si valeur = 30, la date sera vue comme complète 30 jours avant le départ)',
      description: 'Nombre de jours pour la fermeture du voyage',
      initialValue: 30,
    }),
    defineField({
      name: 'pricing',
      type: 'object',
      group: 'pricing',
      title: 'Prix',
      fields: [
        { name: 'startingPrice', type: 'number' } as any,
        { name: 'lastMinuteAvailable', type: 'boolean' } as any,
        { name: 'lastMinuteReduction', type: 'number' } as any,
        { name: 'earlyBirdAvailable', type: 'boolean' } as any,
        { name: 'earlyBirdReduction', type: 'number' } as any,
        { name: 'maxTravelers', type: 'number' } as any,
        { name: 'minTravelersToConfirm', type: 'number' } as any,
        { name: 'indivRoom', type: 'boolean' } as any,
        { name: 'forcedIndivRoom', type: 'boolean' } as any,
        { name: 'indivRoomPrice', type: 'number' } as any,
        { name: 'cseReduction', type: 'number' } as any,
        { name: 'cseAvailable', type: 'boolean' } as any,
        { name: 'childrenPromo', type: 'number' } as any,
        { name: 'childrenAge', type: 'number', initialValue: 12 } as any,
        { name: 'airportCode', type: 'array', of: [{ type: 'string' }] } as any,
        { name: 'capExploraction', 'type': 'boolean', description: 'Si coché, assurance cap-exploraction sinon cap-explorer', initialValue: false } as any,
      ],
    }),
    defineField({
      name: 'accompanistsDescription',
      type: 'array',
      of: [richTextBlock],
      group: 'accompanists',
      title: 'Description accompagnants',
    }),
    defineField({
      name: 'accompanistsList',
      type: 'array',
      group: 'accompanists',
      title: 'Liste accompagnants',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nom', type: 'string' } as any,
            { name: 'description', title: 'Description', type: 'array', of: [richTextBlock] } as any,
            { name: 'role', title: 'Rôle', type: 'string' } as any,
            {
              name: 'image', type: 'image', options: {
                hotspot: true, aiAssist: {
                  imageDescriptionField: 'alt',
                },
              }
            } as any,
          ],
        },
      ],
    }),
    defineField({
      name: 'housingBlock',
      type: 'array',
      group: 'housing',
      title: 'Bloc logement',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' } as any,
            { name: 'housingType', title: 'Type de logement', type: 'string' } as any,
            { name: 'housingMood', title: 'Ambiance du logement', type: 'array', of: [richTextBlock] } as any,
            {
              name: 'image',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: {
                    hotspot: true, aiAssist: {
                      imageDescriptionField: 'alt',
                    },
                  },
                  fields: [{ name: 'alt', type: 'string' } as any],
                },
              ],
            } as any,
          ],
        },
      ],
    }),
    defineField({
      name: 'photosList',
      type: 'array',
      group: 'photoGallery',
      of: [
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' } as any] },
      ],
      title: 'Liste de photos dans la galerie',
    }),
    defineField({
      name: 'videoLinks',
      type: 'array',
      of: [{ type: 'url' }],
      group: 'basic',
      title: 'Liens de videos',
    }),
    defineField({
      name: 'faqBlock',
      type: 'array',
      group: 'faq',
      title: 'Bloc FAQ',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string' } as any,
            { name: 'answer', type: 'array', of: [richTextBlock] } as any,
          ],
        },
      ] as any,
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Configuration SEO pour le voyage',
      group: 'seo',
    }),
  ],
})
