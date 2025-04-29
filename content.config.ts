import fs from 'fs'
import path from 'path'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

// #TODO: Move to content.schema.ts
const teamDir = path.resolve(__dirname, 'content/team')
const teamFiles = fs.readdirSync(teamDir)
const teamChoices = teamFiles
  .map(file => JSON.parse(fs.readFileSync(path.join(teamDir, file), 'utf-8')).name)
  .filter(Boolean) as [string, ...string[]]

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSeoCollection({
        type: 'page',
        source: '*.md',
      }),
    ),
    blog: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'blog/*.md',
        schema: z.object({
          tags: z.array(z.string()),
          image: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }),
          date: z.date(),
          author: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          displayedImg: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }),
          // badge: z.object({
          //   content: z.string(),
          //   color: z.string(),
          // }),
          blogType: z.string(),
          badgeColor: z.string(),
        }),
      }),
    ),
    voyages: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'voyages/*.md',
        schema: z.object({
          slug: z.string(),
          title: z.string(),
          duration: z.string(),
          departureDate: z.date(),
          returnDate: z.date(),
          iso: z.string(),
          startingPrice: z.number(),
          rating: z.number(),
          comments: z.number(),
          imgSrc: z.string(),
          country: z.string(),
          programme: z.string(),
        }),
      }),
    ),
    categories: defineCollection({
      type: 'data',
      source: 'categories/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        image: z.string(),
      }),
    }),
    tops: defineCollection({
      type: 'data',
      source: 'tops/**.json',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        contenuOnglet: z.array(z.object({
          title: z.string(),
          linksList: z.array(z.object({
            title: z.string(),
            slug: z.string(),
          })),
        })),
      }),
    }),
    team: defineCollection({
      type: 'data',
      source: 'team/**.json',
      schema: z.object({
        slug: z.string(),
        name: z.string().optional(),
        image: z.string().optional(),
        description: z.string().optional(),
        linkedin: z.string().optional(),
        position: z.string().optional(),
      }),
    }),
    partenaires: defineCollection({
      type: 'data',
      source: 'partenaires/**.json',
      schema: z.object({
        imgSrc: z.string(),
        description: z.string(),
        isOnHome: z.boolean(),
      }),
    }),
    deals: defineCollection({
      type: 'data',
      source: 'deals/**.json',
      schema: z.object({
        draft: z.boolean().default(false),
        slug: z.string(),
        title: z.string(),
        country: z.string(),
        iso: z.string(),
        zoneChapka: z.number(),
        duration: z.string(),
        startingPrice: z.number(),
        rating: z.number(),
        comments: z.number(),
        indivRoom: z.boolean().optional(),
        privatisationAvailable: z.boolean(),
        groupeAvailable: z.boolean(),
        imgSrc1: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        imgSrc2: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        tooltipChild: z.string(),
        tooltipGroup: z.string(),
        interjection: z.string(),
        dates: z.array(z.object({
          departureDate: z.date(),
          returnDate: z.date(),
          startingPrice: z.number(),
          indivRoomPrice: z.number(),
          maxTravellers: z.number(),
          bookedPlaces: z.number(),
          earlyBird: z.boolean(),
          promoEarlyBird: z.number(),
          lastMinute: z.boolean(),
          promoLastMinute: z.number(),
          promo: z.number(),
          privatized: z.boolean(),
          flyTicketPrice: z.number(),
        })),
      }),
    }),
    travelList: defineCollection({
      type: 'data',
      source: 'travel-list/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
      }),
    }),
    dates: defineCollection({
      type: 'data',
      source: 'dates/*/**.json',
      schema: z.object({
        published: z.boolean().default(false),
        badges: z.array(z.object({
          text: z.string().describe('Texte du badge, utiliser des "*" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
          icon: z.string().editor({ input: 'icon' }),
        })),
        departureDate: z.date().describe('Date de départ du voyage'),
        returnDate: z.date().describe('Date de retour du voyage'),
        startingPrice: z.number().describe('Prix de départ du voyage'),
        maxTravelers: z.number().describe('Nombre de personnes maximum'),
        minTravelers: z.number().describe('Nombre de personnes minimum').default(2),
        bookedTravelers: z.number().describe('Nombre de personnes réservées'),
        includeFlight: z.boolean().describe('Inclure un vol'),
        flightPrice: z.number().describe('Prix du vol si inclus'),
      }),
    }),
    reviews: defineCollection({
      type: 'data',
      source: 'reviews/**.json',
      schema: z.object({
        slug: z.string(),
        author: z.string(),
        authorAge: z.string(),
        photo: z.string(),
        voyagePhoto: z.string(),
        text: z.string(),
        voyageSlug: z.string(),
        voyageTitle: z.string(),
        isOnHome: z.boolean(),
      }),
    }),
    avisVoyageurs: defineCollection({
      type: 'data',
      source: 'avis-voyageurs/**.json',
      schema: z.object({
        author: z.string(),
        photo: z.string(),
        text: z.string(),
        voyageSlug: z.string(),
        voyageTitle: z.string(),
        isDisplayed: z.boolean(),
        note: z.number(),
        date: z.string(),
      }),
    }),
    propos: defineCollection({
      type: 'data',
      source: 'top-bar/propos.json',
      schema: z.object({
        propos: z.array(z.object({
          title: z.string(),
          image: z.string(),
          slug: z.string(),
        })),
      }),
    }),
    destinations: defineCollection({
      type: 'data',
      source: 'destinations/**.json',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        metaDescription: z.string(),
        visible: z.boolean(),
        countries: z.array(z.object({
          country: z.string(),
          image: z.string(),
          slug: z.string(),
          metaDescription: z.string(),
          visible: z.boolean(),
        })),
      }),
    }),
    page_voyage_fr: defineCollection({
      type: 'data',
      source: 'textes/fr/**.json',
      schema: z.object({
        shareButton: z.object({
          text: z.string(),
          icon: z.string().editor({ input: 'icon' }),
        }).describe('Bouton partager en haut de la page'),
        photoButton: z.object({
          text: z.string().describe('Texte du bouton photo, ajouter x à la place du nombre de photos, ex: "Voir les X photos"').default('Voir les X photos'),
          icon: z.string().editor({ input: 'icon' }),
        }).describe('Bouton photo en bas du hero'),
        stickyBlock: z.object({
          pricePrefix: z.string().describe('Texte avant le prix, ex: "à partir de"').default('à partir de'),
          priceSuffix: z.string().describe('Texte après le prix, ex: "/pers"').default('/pers'),
          dateText: z.string().describe('Titre de la section de dates').default('Dates disponibles'),
          dateButtonText: z.string().describe('Texte du bouton de dates, ex: "Voir les dates"').default('Voir tous les départs +'),
          ctaCall: z.object({
            text: z.string().describe('Texte du bouton de CTA, ex: "Contactez-nous"').default('Contactez-nous'),
            icon: z.string().editor({ input: 'media' }).describe('avatar de l\'expert'),
            to: z.string().describe('Lien du bouton de CTA, ex: "/calendly"').default('/calendly'),
          }).describe('CTA en bas du composant'),
          ctaBottom: z.object({
            list: z.array(z.string()).describe('Liste de CTAs en bas, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer d\'avis")'),
          }).describe('Liste de points sous le CTA'),
          privatisationText: z.string().describe('Texte du bouton de privatisation sous le composant').default('Demander une privatisation de ce voyage'),
        }).describe('Section sticky à droite où se trouvent les 3 premières dates et CTAs'),
        authorNote: z.object({
          title: z.string().describe('Titre de la note de l\'auteur').default('En deux mots'),
          text: z.string().describe('Texte de la note de l\'auteur'),
          author: z.enum(teamChoices).describe('Auteur de la note défini dans le fichier team.json'),
        }).describe('Note de l\'auteur sous le hero/section photo, défini dans le dossier team'),
        experiencesBlock: z.object({
          title: z.string().describe('Titre de la section').default('Ce qui vous attend'),
          icon: z.string().editor({ input: 'icon' }),
          color: z.string().describe('Couleur de la section, ex: primary, secondary'),
        }).describe('Section expérience, liste de ce qui vous attend sur le voyage'),
      }),
    }),
  },
})
