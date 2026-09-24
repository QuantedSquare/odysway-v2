import {defineField} from 'sanity'

// Test A/B « prise de rendez-vous » de la page voyage (variante B, ?variante=b).
//
// Chaque champ est facultatif : un champ vide garde le texte par défaut codé dans
// app/utils/rdvVariant.js (affiché ici en placeholder). Ordre de priorité :
//   défaut du code < Page Voyage › Test A/B < Voyage › Bloc rendez-vous

const DEFAULT_HINT = 'Laisser vide pour garder le texte par défaut (affiché en gris).'

const text = (name: string, title: string, placeholder: string, rows?: number) =>
  defineField({
    name,
    title,
    type: rows ? 'text' : 'string',
    ...(rows && {rows}),
    placeholder,
  })

// Champs du bloc principal, partagés entre Page Voyage (valeurs globales) et
// Voyage (surcharge par voyage : puces spécifiques, spécialiste de la destination).
export const rdvSectionContentFields = [
  text('kicker', 'Surtitre', 'Avant de réserver'),
  text('title', 'Titre', 'Avant de choisir une date, parlons de votre séjour'),
  defineField({
    name: 'displayMode',
    title: 'Présentation',
    type: 'string',
    description: 'Paragraphe + puces (par défaut), ou l\'un des deux seulement.',
    options: {
      list: [
        {title: 'Texte + puces', value: 'both'},
        {title: 'Puces seules', value: 'bullets'},
        {title: 'Texte seul', value: 'text'},
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
  }),
  text(
    'text',
    'Texte',
    'Ce voyage se prépare à quelques détails près : la meilleure période selon vos envies, le vol qui part de chez vous, l\'âge des enfants, la chambre individuelle. Vingt minutes suffisent à tout caler.',
    3,
  ),
  defineField({
    name: 'bullets',
    title: 'Puces',
    description: 'Phrases courtes : au-delà de 2 lignes, le texte est coupé.',
    type: 'array',
    of: [{type: 'string'}],
    validation: Rule => Rule.max(6),
  }),
  defineField({
    name: 'specialist',
    title: 'Spécialiste',
    description: 'Membre de l\'équipe affiché sous le texte (photo et nom). Sans référence : « Nom du spécialiste » + initiale.',
    type: 'reference',
    to: [{type: 'teamMember'}],
  }),
  text('specialistName', 'Nom du spécialiste (sans référence)', 'Lucie'),
  text('specialistTitle', 'Titre du spécialiste', 'spécialiste Grand Nord'),
  text('specialistSubtitle', 'Sous-titre du spécialiste', 'Répond aussi sur WhatsApp, du lundi au vendredi, de 9 h à 19 h'),
]

export const rdvVariantField = defineField({
  name: 'rdvVariant',
  title: 'Test A/B : variante rendez-vous',
  description: `Page servie avec ?variante=b (toute valeur autre que « a » ou « ga »). ${DEFAULT_HINT}`,
  type: 'object',
  group: 'rdv_ab_test',
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'enabled',
      title: 'Variante active',
      description: 'Décocher pour servir la page actuelle à tout le monde, même avec ?variante=b.',
      type: 'boolean',
      initialValue: true,
    }),
    text('calLink', 'Lien Cal.com (utilisateur/événement)', 'odysway/rendez-vous'),
    defineField({
      name: 'infoCard',
      title: 'Carte de droite',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        text('rdvButtonText', 'Bouton rendez-vous', 'Prendre rendez-vous'),
        text('reassureText', 'Texte sous le bouton', '20 minutes au téléphone avec un spécialiste. Sans engagement.'),
        text('datesButtonText', 'Bouton dates', 'Voir les dates de départ'),
        text('guaranteedLabel', 'Libellé départs garantis', 'Départs garantis'),
        text('scheduledLabel', 'Libellé départs programmés (si aucun garanti)', 'Départs programmés'),
      ],
    }),
    defineField({
      name: 'rdvSection',
      title: 'Bloc rendez-vous principal',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        ...rdvSectionContentFields,
        text('slotsTitle', 'Titre des créneaux', 'Prochains créneaux'),
        text('slotsSubtitle', 'Sous-titre des créneaux', 'Téléphone ou visio, 20 minutes'),
        defineField({
          name: 'slotsCount',
          title: 'Nombre de créneaux affichés',
          type: 'number',
          placeholder: '3',
          validation: Rule => Rule.min(0).max(6).integer(),
        }),
        text('seeAllSlotsText', 'Bouton tous les créneaux', 'Voir tous les créneaux'),
        text('slotsFooter', 'Texte sous les créneaux', 'Vous repartez de l\'appel avec un devis écrit, vols compris.'),
        text('noSlotsText', 'Texte si aucun créneau', 'Choisissez le créneau qui vous convient dans notre agenda.'),
      ],
    }),
    defineField({
      name: 'band',
      title: 'Bandeau de relance (après l\'hébergement)',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        text('text', 'Texte', 'Vous hésitez entre deux dates, ou vous attendez le bon prix de vol ? Nous comparons ensemble en vingt minutes.', 2),
        text('buttonText', 'Bouton', 'Prendre rendez-vous'),
      ],
    }),
    defineField({
      name: 'dates',
      title: 'Liste réduite des départs',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        text('title', 'Titre', 'Les prochains départs'),
        text('subtitle', 'Sous-titre', 'Vous savez déjà quelle date vous convient ? Réservez directement.'),
        text('bookButtonText', 'Bouton réserver', 'S\'inscrire ou poser une option'),
        defineField({
          name: 'initialCount',
          title: 'Nombre de départs affichés avant « Voir plus »',
          type: 'number',
          placeholder: '3',
          validation: Rule => Rule.min(1).max(10).integer(),
        }),
        text('moreText', 'Lien voir plus', 'Voir plus de dates'),
        text('lessText', 'Lien voir moins', 'Voir moins de dates'),
        text('emptyText', 'Texte si aucun départ', 'Aucun départ programmé pour le moment. Parlons-en : nous pouvons ouvrir une date ou organiser un voyage sur mesure.', 2),
      ],
    }),
    defineField({
      name: 'nudge',
      title: 'Relance après la FAQ',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        text('title', 'Titre', 'Votre question n\'est pas dans la FAQ ?'),
        text('subtitle', 'Sous-titre', 'Posez-la de vive voix, la réponse prend deux minutes.'),
        text('buttonText', 'Bouton', 'Prendre rendez-vous'),
      ],
    }),
    defineField({
      name: 'bottomBar',
      title: 'Barre du bas (mobile)',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        text('datesText', 'Lien dates', 'Voir les dates'),
        text('rdvButtonText', 'Bouton rendez-vous', 'Prendre rendez-vous'),
      ],
    }),
  ],
})

// Surcharge par voyage du bloc principal (Voyage › Bloc rendez-vous).
export const rdvBlockField = defineField({
  name: 'rdvBlock',
  title: 'Bloc rendez-vous (test A/B)',
  description: `Surcharge, pour ce voyage, du bloc « Avant de réserver » de la variante rendez-vous. Vide = textes de Page Voyage. ${DEFAULT_HINT}`,
  type: 'object',
  group: 'rdv_ab_test',
  options: {collapsible: true, collapsed: true},
  fields: rdvSectionContentFields,
})
