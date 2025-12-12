<template>
  <div>
    <HomeHeroSection
      v-if="homeSanity"
      :image="homeSanity.heroSection.image"
      :typewriter-words="['partout dans le monde', 'au Japon', 'au Brésil', 'en France']"
    >
      <template #title>
        <p>La rencontre au coeur du voyage</p>
        <!-- <EnrichedText class="text-white" :value="homeSanity.heroSection.title" /> -->
      </template>
      <template #subtitle>
        <p>Voyages en petit groupes et privatifs</p>
        <!-- <EnrichedText class="text-white" :value="homeSanity.heroSection.subtitle" /> -->
      </template>
    </HomeHeroSection>
    <v-container
      v-once
      fluid
      class="mx-0 mx-md-5 px-1"
    >
      <section class="py-0 my-0 px-2 px-md-4">
        <LazyExperienceCarousel
          v-if="homeSanity && homeSanity.experienceCarousel?.experiences?.length > 0"
          :experiences-data="homeSanity.experienceCarousel.experiences"
        >
          <template #title>
            {{ homeSanity.experienceCarousel.title }}
          </template>
        </LazyExperienceCarousel>

        <LazyColorContainer
          v-once
          color="soft-blush"
        >
          <LazyHorizontalCarousel text-color="primary">
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
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <LazyColorContainer color="primary">
          <LazyCardGrid :categories="homeSanity.followDesires.categoriesFollowDesires">
            <template #title>
              <h4 class="text-white">
                {{ homeSanity.followDesires.title }}
              </h4>
            </template>
          </LazyCardGrid>
        </LazyColorContainer>

        <LazyColorContainer color="white">
          <LazyTextImageContainer
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
          </LazyTextImageContainer>
        </LazyColorContainer>

        <LazyColorContainer color="grey-light">
          <LazyHorizontalCarousel :text-color="'primary'">
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
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <LazyColorContainer color="white">
          <LazyHorizontalCarousel :text-color="'primary'">
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
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <LazyColorContainer color="soft-blush">
          <ClientOnly>
            <NewsletterContainer v-if="homeSanity.newsletter">
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
          </ClientOnly>
        </LazyColorContainer>

        <LazyColorContainer
          white-text
          color="primary"
        >
          <LazyHorizontalCarousel :text-color="'white'">
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
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <LazyColorContainer color="white">
          <LazyCommonReviewContainer>
            <template #title>
              <span style="color: rgba(43, 76, 82, 1)">
                {{ homeSanity.reviews.title }}
              </span>
            </template>
            <template #cta>
              {{ homeSanity.reviews.ctaText }}
            </template>
          </LazyCommonReviewContainer>
        </LazyColorContainer>

        <LazyColorContainer color="grey-light-2">
          <LazyInfoContainer>
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
          </LazyInfoContainer>
        </LazyColorContainer>
      </section>
    </v-container>
  </div>
</template>

<script setup>
const sanity = useSanity()

definePageMeta({
  layout: 'homepage',
})
const homeQuery = groq`
  *[_type == "homePage"][0]{
    ...,
    reviews{
      ctaText,
      title
    },
    seo{
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      keywords,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage{
        asset->{
          _ref,
          _id,
          url
        },
        alt
      }
    },
    franceTrips{
      title,
      voyagesFrance[]->{
        _id,
        slug,
        image,
        rating,
        comments,
        title,
        availabilityTypes,
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
        availabilityTypes,
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
        availabilityTypes,
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
        availabilityTypes,
        duration,
        pricing
      }
    }
  }
`

const { data: homeSanity } = await useAsyncData('home', () =>
  sanity.fetch(homeQuery),
)
if (homeSanity.value) {
  // Fallback values for content
  const defaultContent = {
    title: 'Odysway - Voyages en Petits Groupes et Expériences Authentiques',
    description: 'Découvrez nos voyages en petits groupes à travers le monde. Expériences authentiques, rencontres locales et aventures inoubliables avec Odysway.',
    image: homeSanity.value.heroSection?.image,
  }

  // Use the SEO composable
  useSeo({
    seoData: homeSanity.value.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'home',
    baseUrl: '/',
    structuredData: [
      createOrganizationSchema({
        description: homeSanity.value.seo?.metaDescription || defaultContent.description,
      }),
      createWebSiteSchema(),
    ],
  })
}
</script>
