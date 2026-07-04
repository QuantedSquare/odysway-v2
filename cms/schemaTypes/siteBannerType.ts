import { defineField, defineType } from 'sanity'

export const siteBannerType = defineType({
  name: 'siteBanner',
  title: 'Bannière du site',
  type: 'document',
  preview: {
    select: { enabled: 'enabled', text: 'text' },
    prepare({ enabled, text }) {
      return {
        title: text || 'Bannière du site',
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
      description: 'Affiche la bannière sous le header sur tout le site (hors tunnel de paiement).',
    }),
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Bouton — Label',
      type: 'string',
      description: 'Laisser vide pour afficher la bannière sans bouton.',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Bouton — Lien',
      type: 'string',
      description: 'Chemin interne (ex: /offre-cadeau) ou URL complète (https://...).',
    }),
    defineField({
      name: 'variant',
      title: 'Couleur de fond',
      type: 'string',
      options: {
        list: [
          { title: 'Primaire (bleu)', value: 'primary' },
          { title: 'Secondaire', value: 'secondary' },
          { title: 'Soft blush', value: 'soft-blush' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
  ],
})
