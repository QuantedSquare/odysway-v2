import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

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
  },
})
