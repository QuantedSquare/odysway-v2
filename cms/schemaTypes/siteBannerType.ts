import { defineField, defineType } from 'sanity'

export const siteBannerType = defineType({
  name: 'siteBanner',
  title: 'Bandeau du site',
  type: 'document',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'display', title: 'Affichage' },
  ],
  preview: {
    select: { enabled: 'enabled', tag: 'tag', content: 'content', startDate: 'startDate', endDate: 'endDate' },
    prepare({ enabled, tag, content, startDate, endDate }: {
      enabled?: boolean
      tag?: string
      content?: { _type: string, children?: { _type: string, text?: string }[] }[]
      startDate?: string
      endDate?: string
    }) {
      const firstText = content
        ?.find(block => block._type === 'block')
        ?.children?.find(child => child._type === 'span')?.text
      const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')
      const dateWindow = [
        startDate ? `dès le ${formatDate(startDate)}` : '',
        endDate ? `jusqu'au ${formatDate(endDate)}` : '',
      ].filter(Boolean).join(' ')
      return {
        title: [tag, firstText].filter(Boolean).join(' — ') || 'Bandeau du site',
        subtitle: [enabled ? '🟢 Activé' : '⚪️ Désactivé', dateWindow].filter(Boolean).join(' · '),
      }
    },
  },
  fields: [
    defineField({
      name: 'enabled',
      title: 'Activer le bandeau',
      type: 'boolean',
      group: 'display',
      initialValue: false,
      description: 'Affiche le bandeau au-dessus du menu, sur tout le site public (hors tunnel de réservation et back-office).',
    }),
    defineField({
      name: 'tag',
      title: 'Étiquette',
      type: 'string',
      group: 'content',
      description: 'Optionnel. Court label affiché dans une pastille colorée à gauche (ex : « Offre août »). 20 caractères max conseillés.',
      validation: Rule => Rule.max(28),
    }),
    defineField({
      name: 'content',
      title: 'Message',
      type: 'array',
      group: 'content',
      description: 'Une phrase courte : le bandeau est sur une seule ligne en desktop. Gras, italique, liens et petites icônes en ligne.',
      validation: Rule => Rule.required().min(1),
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Lien',
                fields: [
                  {
                    name: 'href',
                    type: 'string',
                    title: 'Lien',
                    description: 'Chemin interne (ex: /offre-cadeau) ou URL complète (https://...).',
                    validation: rule => rule.required(),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Ouvrir dans un nouvel onglet',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          title: 'Icône en ligne',
          options: { hotspot: true },
          description: 'Petite icône affichée dans le texte (limitée à 20 px de haut).',
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif',
              validation: rule => rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Bouton — Label',
      type: 'string',
      group: 'content',
      description: 'Optionnel. Laisser vide pour afficher le bandeau sans bouton (ex : « J\'en profite »).',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Bouton — Lien',
      type: 'string',
      group: 'content',
      description: 'Chemin interne (ex: /offre-cadeau) ou URL complète (https://...).',
      validation: Rule => Rule.custom((value, context) => {
        if (context.document?.ctaLabel && !value) return 'Un lien est requis lorsque le bouton a un label.'
        return true
      }),
    }),
    defineField({
      name: 'variant',
      title: 'Style de fond',
      type: 'string',
      group: 'display',
      options: {
        list: [
          { title: 'Primaire (teal)', value: 'primary' },
          { title: 'Secondaire (terracotta)', value: 'secondary' },
          { title: 'Soft blush (clair)', value: 'soft-blush' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'dismissible',
      title: 'Fermable par le visiteur',
      type: 'boolean',
      group: 'display',
      initialValue: true,
      description: 'Affiche la croix de fermeture. La fermeture est mémorisée jusqu\'à la prochaine modification du bandeau.',
    }),
    defineField({
      name: 'startDate',
      title: 'Afficher à partir du',
      type: 'datetime',
      group: 'display',
      description: 'Optionnel. Avant cette date le bandeau reste masqué même s\'il est activé.',
    }),
    defineField({
      name: 'endDate',
      title: 'Masquer après le',
      type: 'datetime',
      group: 'display',
      description: 'Optionnel. Passée cette date le bandeau disparaît automatiquement.',
      validation: Rule => Rule.min(Rule.valueOfField('startDate')).warning('La date de fin devrait être postérieure à la date de début.'),
    }),
  ],
})
