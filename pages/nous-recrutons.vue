<template>
  <div>
 

    
    <HeroSection
      v-if="page?.heroImage"
      :image-src="page.heroImage"
    >
      <template #title>
        {{ page.title }}
      </template>
    </HeroSection>
 
    <!-- Content Section -->
    <SectionContainer v-if="page">
      <template #content>
        <EnrichedText
          v-if="page.content"
          :value="page.content"
        />

        <div
          v-if="page.jobOffers && page.jobOffers.length > 0"
          class="mt-8"
        >
          <RecruitementCard
            v-for="(job, index) in page.jobOffers"
            :key="index"
            :link="job.applicationLink"
            class="mb-4"
          >
            <template #text>
              <p>
              {{ job.title }}
              <span v-if="job.location"> | {{ job.location }}</span>
              </p>
            </template>
            <template #cta>
              {{ job.ctaText || 'Postuler' }}
            </template>
          </RecruitementCard>
        </div>
      </template>
    </SectionContainer>

    <!-- Loading State -->
    <div
      v-else-if="status === 'pending'"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const query = groq`*[_type == "recruitment" && slug.current == "nous-recrutons"][0]{
  title,
  heroImage,
  content,
  jobOffers[]{
    title,
    location,
    description,
    applicationLink,
    ctaText
  }
}`

const { data: page, status } = await useAsyncData('nous-recrutons', () =>
  sanity.fetch(query)
)
</script>
