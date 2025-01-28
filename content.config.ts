import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
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
        startingPrice: z.number(),
        rating: z.number(),
        comments: z.number(),
        imgSrc: z.string(),
        country: z.string(),
      }),
    }),
  },
})
