import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
    }),
    categories: defineCollection({
      type: 'data',
      source: 'categories/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        image: z.string(),
      }),
    }),
    voyages: defineCollection({
      type: 'data',
      source: 'voyages/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        duration: z.string(),
        departureDate: z.string(),
        returnDate: z.string(),
        iso: z.string(),
        startingPrice: z.number(),
        rating: z.number(),
        comments: z.number(),
        imgSrc: z.string(),
        country: z.string(),
      }),
    }),
    deals: defineCollection({
      type: 'data',
      source: 'deals/**.json',
      schema: z.object({
        draft: z.boolean().default(false),
        title: z.string(),
        imgSrc1: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        imgSrc2: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        country: z.string(),
        slug: z.string(),
        ISO: z.string(),
        zoneChapka: z.number(),
        indivRoom: z.boolean(),
        privatisation: z.boolean(),
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
    partenaires: defineCollection({
      type: 'data',
      source: 'partenaires/**.json',
      schema: z.object({
        imgSrc: z.string(),
        description: z.string(),
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
  },
})
