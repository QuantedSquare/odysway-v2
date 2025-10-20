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
const homeQuery = `
  *[_type == "homePage"][0]{
    ...,
    seo,
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

const { data: homeSanity } = await useSanityQuery(homeQuery)
if (homeSanity.value) {
  // Set the page title explicitly
  // useSeoMeta overRide useHead
  useHead({
    title: homeSanity.value.seo?.title || homeSanity.value.title,
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
    ...homeSanity.value.head,
  })

  console.log('homeSanity', homeSanity.value.seo)
  // Set SEO meta tags
  useSeoMeta({
    title: homeSanity.value.seo?.title || homeSanity.value.title,
    description: homeSanity.value.seo?.description || homeSanity.value.description,
    ogTitle: homeSanity.value.seo?.title || homeSanity.value.title,
    ogDescription: homeSanity.value.seo?.description || homeSanity.value.description,
    ogType: 'website',
    ogUrl: 'https://odysway.com/',
    twitterTitle: homeSanity.value.seo?.title || homeSanity.value.title,
    twitterDescription: homeSanity.value.seo?.description || homeSanity.value.description,
    twitterCard: 'summary_large_image',
    canonical: 'https://odysway.com/',
    robots: homeSanity.value.robots || 'index, follow',
  })
}
</script>
