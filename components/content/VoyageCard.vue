<template>
  <v-col
    v-if="voyage"
    cols="12"
    sm="6"
    md="4"
  >
    <v-card
      max-width="400"
      elevation="0"
      class="py-0"
    >
      <NuxtLink
        :key="`Voyage ${voyage.slug}`"
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none position-relative"
      >
        <v-img
          height="220"
          :src="voyage.imgSrc"
          :alt="`Image principale du voyage ${voyage.title}`"
          rounded="lg"
          cover
        />
        <client-only>
          <div class="d-flex justify-end ga-1 mt-4 mr-1 position-absolute top-0 right-0">
            <v-tooltip
              location="bottom"
              text="Test tooltip"
            >
              <template #activator="{ props }">
                <VBtnTooltip
                  v-bind="props"
                  icon
                >
                  <v-icon
                    icon="mdi-account-group"
                    color="white"
                  />
                </VBtnTooltip>
              </template>
            </v-tooltip>
            <v-tooltip
              location="bottom"
              text="Test tooltip"
            >
              <template #activator="{ props }">
                <VBtnTooltip
                  v-bind="props"
                >
                  <v-img
                    src="/icons/child.svg"
                    alt="Child icon"
                    class="svg-child-icon"
                  />
                </VBtnTooltip>
              </template>
            </v-tooltip>
          </div>
        </client-only>
      </NuxtLink>
      <NuxtLink
        :to="`/destinations/${voyage.country}`"
        class="text-decoration-none"
      >
        <v-card-text class="font-weight-bold pa-2 d-flex align-center">
          <span>
            <span class="text-primary hover-underline">{{ voyage.country }} </span><span class="text-secondary"> - {{
              voyage.duration }}</span>
          </span>
        </v-card-text>
      </NuxtLink>
      <NuxtLink
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none"
      >
        <v-card-title class="text-body-1 font-weight-bold pa-2 text-textColor">
          {{ voyage.title }}
        </v-card-title>
        <v-card-text class="text-body-2 pa-2">
          <span class="text-grey-darken-2 "> A partir de </span>
          <span class="font-weight-bold text-textColor">{{ voyage.startingPrice }}€</span>
        </v-card-text>
        <div
          v-if="voyage.comments > 0"
          class="d-flex align-center px-2 text-textColor"
        >
          <client-only>
            <v-rating
              :key="`rating-${voyage.slug}`"
              half-increments
              :size="24"
              :model-value="voyage.rating"
              readonly
              color="orange-lighten-1"
            />
            <span>({{ voyage.comments }})</span>
          </client-only>
        </div>
      </NuxtLink>
    </v-card>
  </v-col>
</template>

<script setup>
const props = defineProps({
  voyageSlug: {
    type: String,
    required: true,
  },
})

const { data: voyage } = await useAsyncData(`voyage-${props.voyageSlug}`, () => {
  return queryCollection('voyages').where('slug', '=', props.voyageSlug).first()
})
</script>

<style scoped>
.hover-underline:hover{
  text-decoration: underline;
}
.svg-child-icon {
    width: 1rem;
    height: 1rem;
}
</style>
