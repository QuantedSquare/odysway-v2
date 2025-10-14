<template>
  <v-container
    class="py-0 my-0 px-2 px-md-4"
    fluid
  >
    <HomeHeroSection
      v-if="homeSanity"
      :image="homeSanity.heroSection.image"
    >
      <template #title>
        <EnrichedText
          class="text-white"
          :value="homeSanity.heroSection.title"
        />
      </template>
    </HomeHeroSection>
    <ExperienceCarousel
      v-if="homeSanity"
      :experiences-data="homeSanity.experienceCarousel.experiences"
    >
      <template #title>
        {{ homeSanity.experienceCarousel.title }}
      </template>
    </ExperienceCarousel>

    <ColorContainer color="soft-blush">
      <HorizontalCarousel text-color="primary">
        <template #title>
          <span style="color: rgba(43, 76, 82, 1)">
            {{ homeSanity.franceTrips.title }}
          </span>
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in homeSanity.franceTrips.voyagesFrance"
            :key="voyage._id"
          >
            <VoyageCard :voyage="voyage" />
          </v-col>
        </template>
      </HorizontalCarousel>
    </ColorContainer>

    <ColorContainer color="primary">
      <CardGrid :categories="homeSanity.followDesires.categoriesFollowDesires">
        <template #title>
          {{ homeSanity.followDesires.title }}
        </template>
      </CardGrid>
    </ColorContainer>

    <ColorContainer color="white">
      <TextImageContainer
        :display-cta-button="true"
        :image-desktop-right="true"
        :image-src="homeSanity.travelDifferently.image"
      >
        <template #title>
          <span style="color: rgba(43, 76, 82, 1)">
            {{ homeSanity.travelDifferently.title }}
          </span>
        </template>
        <template #content-cols>
          <IconTextCol
            v-for="feature in homeSanity.travelDifferently.features"
            :key="feature._id"
            :icon="feature.icon"
            :side-by-side="false"
          >
            <template #text>
              {{ feature.text }}
            </template>
          </IconTextCol>
        </template>
        <template #cta-button>
          <CtaButton
            :color="homeSanity.travelDifferently.ctaButton.color"
            :link="homeSanity.travelDifferently.ctaButton.link"
          >
            <template #text>
              {{ homeSanity.travelDifferently.ctaButton.text }}
            </template>
          </CtaButton>
        </template>
      </TextImageContainer>
    </ColorContainer>

    <ColorContainer color="grey-light">
      <HorizontalCarousel :text-color="'primary'">
        <template #title>
          <span style="color: rgba(43, 76, 82, 1)">
            {{ homeSanity.guaranteedDepartures.title }}
          </span>
        </template>

        <template #carousel-item>
          <v-col
            v-for="voyage in homeSanity.guaranteedDepartures.voyagesGuaranteedDepartures"
            :key="voyage._id"
          >
            <VoyageCard :voyage="voyage" />
          </v-col>
        </template>
      </HorizontalCarousel>
    </ColorContainer>

    <ColorContainer color="white">
      <HorizontalCarousel :text-color="'primary'">
        <template #title>
          {{ homeSanity.summerTravel.title }}
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in homeSanity.summerTravel.voyagesSummerTravel"
            :key="voyage._id"
          >
            <VoyageCard :voyage="voyage" />
          </v-col>
        </template>
      </HorizontalCarousel>
    </ColorContainer>

    <ColorContainer color="soft-blush">
      <NewsletterContainer>
        <template #title>
          <EnrichedText :value="homeSanity.newsletter.title" />
        </template>
        <template #subtitle>
          <EnrichedText
            class="text-grey"
            :value="homeSanity.newsletter.subtitle"
          />
        </template>
      </NewsletterContainer>
    </ColorContainer>

    <ColorContainer
      white-text
      color="primary"
    >
      <HorizontalCarousel
        :text-color="'white'"
      >
        <template #title>
          {{ homeSanity.unforgettableTravels.title }}
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in homeSanity.unforgettableTravels.voyagesUnforgettableTravels"
            :key="voyage._id"
          >
            <VoyageCard :voyage="voyage" />
          </v-col>
        </template>
      </HorizontalCarousel>
    </ColorContainer>

    <ColorContainer color="white">
      <CommonReviewContainer>
        <template #title>
          <span style="color: rgba(43, 76, 82, 1)">
            {{ homeSanity.reviews.title }}
          </span>
        </template>
        <template #cta>
          {{ homeSanity.reviews.ctaText }}
        </template>
      </CommonReviewContainer>
    </ColorContainer>

    <ColorContainer color="grey-light-2">
      <InfoContainer>
        <template #top>
          <AvatarsRowStack />
        </template>
        <template #title>
          {{ homeSanity.contact.title }}
        </template>
        <template #description>
          {{ homeSanity.contact.description }}
        </template>
        <template #bottom>
          <CtaButton
            :color="homeSanity.contact.ctaButton.color"
            :link="homeSanity.contact.ctaButton.link"
          >
            <template #text>
              {{ homeSanity.contact.ctaButton.text }}
            </template>
          </CtaButton>
        </template>
      </InfoContainer>
    </ColorContainer>
  </v-container>
</template>

<script setup>
const { data: page } = await useAsyncData('homepage', () => queryCollection('content').path('/').first())

const homeQuery = `
  *[_type == "homePage"][0]{
    ...,
    franceTrips{
      title,
      voyagesFrance[]->{
        _id,
        slug,
        image,
        rating,
        comments,
        title,
        groupeAvailable,
        duration,
        pricing
      }
    },
    experienceCarousel{
      title,
      experiences[]->{
        _id,
        title,
        slug,
        discoveryTitle,
        showOnHome,
        image
      }
    },
    followDesires{
      title,
      categoriesFollowDesires[]->{
        _id,
        title,
        slug,
        discoveryTitle,
        showOnHome,
        image
      }
    },
    guaranteedDepartures{
      title,
      voyagesGuaranteedDepartures[]->{
        _id,
        slug,
        image,
        rating,
        comments,
        title,
        groupeAvailable,
        duration,
        pricing
      }
    },
    summerTravel{
      title,
      voyagesSummerTravel[]->{
        _id,
        slug,
        image,
        rating,
        comments,
        title,
        groupeAvailable,
        duration,
        pricing
      }
    },
    unforgettableTravels{
      title,
      voyagesUnforgettableTravels[]->{
        _id,
        slug,
        image,
        rating,
        comments,
        title,
        groupeAvailable,
        duration,
        pricing
      }
    }
  }
`

const { data: homeSanity } = await useSanityQuery(homeQuery, {}, {
  key: 'home-page',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})
console.log('homeSanity ', homeSanity.value)
if (page.value) {
  // Set the page title explicitly
  useHead({
    title: page.value.seo?.title || page.value.title,
    htmlAttrs: {
      lang: 'fr',
    },
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
    ...page.value.head,
  })

  // Set SEO meta tags
  useSeoMeta({
    title: page.value.seo?.title || page.value.title,
    description: page.value.seo?.description || page.value.description,
    ogTitle: page.value.seo?.title || page.value.title,
    ogDescription: page.value.seo?.description || page.value.description,
    ogType: 'website',
    ogUrl: 'https://odysway.com/',
    twitterTitle: page.value.seo?.title || page.value.title,
    twitterDescription: page.value.seo?.description || page.value.description,
    twitterCard: 'summary_large_image',
    canonical: 'https://odysway.com/',
    robots: page.value.robots || 'index, follow',
  })
}
</script>
