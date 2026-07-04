import { defineField, defineType } from 'sanity'

export const siteBannerType = defineType({
  name: 'siteBanner',
  title: 'Bannière du site',
  type: 'document',
  preview: {
    select: { enabled: 'enabled', content: 'content' },
    prepare({ enabled, content }) {
      const firstText = content
        ?.find((block) => block._type === 'block')
        ?.children?.find((child) => child._type === 'span')?.text
      return {
        title: firstText || 'Bannière du site',
        subtitle: enabled ? '🟢 Activée' : '⚪️ Désactivée',
      }
    },
  },
  fields: [
    defineField({
      name: 'enabled',
      title: 'Activer la bannière',
      type: 'boolean',
      initialValue: false,
      description: 'Affiche la bannière flottante sur tout le site public (hors tunnel de paiement).',
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'array',
      description: 'Texte enrichi : gras, italique, liens, et petites images / icônes en ligne.',
      validation: (Rule) => Rule.required().min(1),
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
                    validation: (rule) => rule.required(),
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
          title: 'Image / Icône',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif',
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Bouton — Label',
      type: 'string',
      description: 'Optionnel. Laisser vide pour afficher la bannière sans bouton.',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Bouton — Lien',
      type: 'string',
      description: 'Chemin interne (ex: /offre-cadeau) ou URL complète (https://...).',
    }),
    defineField({
      name: 'variant',
      title: 'Style de fond',
      type: 'string',
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
  ],
})
