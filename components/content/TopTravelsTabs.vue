<template>
  <!-- Loading State -->
  <v-container
    v-if="pending"
    fluid
    class="rounded-lg px-md-12 py-md-8 mt-4 mt-md-8 bg-primary max-container-width d-flex justify-center align-center"
    style="min-height: 300px;"
  >
    <v-progress-circular
      indeterminate
      color="white"
      size="48"
    />
  </v-container>

  <!-- Error State -->
  <v-container
    v-else-if="error"
    fluid
    class="rounded-lg px-md-12 py-md-8 mt-4 mt-md-8 bg-primary max-container-width"
  >
    <v-alert
      type="error"
      variant="tonal"
    >
      Impossible de charger les idées de voyages. Veuillez réessayer plus tard.
    </v-alert>
  </v-container>

  <!-- Content State -->
  <v-container
    v-else-if="data && data.length > 0"
    fluid
    class="rounded-lg px-md-12 py-md-8 mt-4 mt-md-8 bg-primary max-container-width "
  >
    <div class="text-h3 font-weight-bold my-4">
      Des idées pour vos prochains voyages
    </div>

    <div class="tabs-container position-relative mb-6 mt-md-10 custom-color ">
      <v-tabs
        v-model="currentTab"
        class="text-white-light  "
        color="white-light"
        role="tablist"
        :aria-label="`Navigation des idées de voyages`"
      >
        <v-tab
          v-for="top, index in data"
          :id="`tab-${index}`"
          :key="index"
          :value="index"
          role="tab"
          class="text-decoration-none pb-md-8 "
          :aria-selected="(currentTab === index).toString()"
          :aria-controls="`tabpanel-${index}`"
          :class="index === 0 ? 'pl-0' : 'pl-4'"
        >
          <span
            class="custom-title-size justify-self-start"
            :class="currentTab === index ? 'text-white font-weight-bold' : 'custom-color font-weight-regular'"
          >
            {{ top.title }}
          </span>
        </v-tab>
      </v-tabs>
      <v-divider
        class="absolute-divider"
        thickness="2"
        role="presentation"
        aria-hidden="true"
      />
    </div>

    <v-tabs-window
      v-model="currentTab"
      class="custom-color"
    >
      <v-tabs-window-item
        :id="`tabpanel-${currentTab}`"
        :value="currentTab"
        role="tabpanel"
        :aria-labelledby="`tab-${currentTab}`"
      >
        <v-row class=" mb-4 mb-md-10  flex-nowrap overflow-auto hidden-scroll">
          <v-col
            v-for="section, index in data[currentTab].contenuOnglet"
            :key="`${section.title}-${index}`"
            md="2"
          >
            <h5 class="custom-title-size font-weight-bold mb-4 pb-md-16 ">
              {{ section.title }}
            </h5>
            <div class="d-flex flex-column ga-md-2">
              <template
                v-for="link, i in section.linksList"
                :key="`${link.slug}-${i}`"
              >
                <SmartLink
                  :to="link.slug.includes('http') ? link.slug : `/${link.slug}`"
                  link-class="line-clamp-2 text-caption text-md-body-2 font-weight-regular pb-2 pb-md-4"
                >
                  {{ link.title }}
                </SmartLink>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
const currentTab = ref(0)

// Optimized GROQ query - fetch only required fields
const topsQuery = `
  *[_type == "tops"]|order(orderRank) {
    _id,
    title,
    contenuOnglet[]{
      title,
      linksList[]{
        title,
        slug
      }
    }
  }
`

// Fetch tops data with SSR support
const { data, error, pending } = await useAsyncData(
  'tops',
  async () => {
    const { data } = await useSanityQuery(topsQuery)
    return data.value
  },
  {
    // Reuse cached data on client-side navigation
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    },
  },
)
</script>

<style scoped>
.absolute-divider {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.line-clamp-2{
  overflow: hidden;
  font-weight: 500!important;
  line-height: 1.2!important;
}
.custom-color:deep(a), .custom-color:deep(div){
  color: #FFFFFF80!important;
}
@media (min-width: 600px) {
  .custom-title-size {
    font-size: 20px !important;
    text-transform: none;
    max-height: 50px!important;
    line-height: 1.2!important;
  }
}

.hidden-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-x: scroll;
  scrollbar-width: thin;

}
</style>
