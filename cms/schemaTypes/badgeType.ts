import {defineField, defineType} from 'sanity'

export const badgeType = defineType({
  name: 'badge',
  title: 'Badge',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titre du badge',
      description: 'Nom interne pour identifier le badge (ex: "Badge Groupe", "Badge Durée")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'Identifiant unique pour la migration (ex: "groupe", "duree", "vol-inclus")',
      options: {source: 'title'}
    }),
    defineField({
      name: 'text',
      type: 'string',
      title: 'Texte du badge',
      description: 'Utilisez {var1} et/ou {var2} pour les valeurs dynamiques (ex: "Groupe de {var1} à {var2}")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hasVariable',
      type: 'boolean',
      title: 'Contient des variables',
      description: 'Ce badge nécessite des valeurs dynamiques',
      initialValue: false,
    }),
    defineField({
      name: 'variable1Label',
      type: 'string',
      title: 'Label variable 1',
      description: 'Ex: "Nombre min", "Durée", etc.',
      hidden: ({document}) => !document?.hasVariable,
    }),
    defineField({
      name: 'variable2Label',
      type: 'string',
      title: 'Label variable 2 (optionnel)',
      description: 'Ex: "Nombre max", laisser vide si une seule variable',
      hidden: ({document}) => !document?.hasVariable,
    }),
    defineField({
      name: 'picto',
      type: 'image',
      title: 'Pictogramme (optionnel)',
      description: 'Icône ou image à afficher',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'color',
      type: 'color',
      title: 'Couleur',
      description: 'Couleur du badge',
      options: {
        disableAlpha: false,
        colorList: [
           {hex: '#2B4C52'},
           {hex: '#DB6644'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      text: 'text',
      slug: 'slug.current',
      picto: 'picto',
      colorHex: 'color.hex',
    },
    prepare({title, text, slug, picto, colorHex}) {
      return {
        title: title || text,
        subtitle: `${slug || ''} ${colorHex ? `• ${colorHex}` : ''}`,
        media: picto,
      }
    },
  },
})
