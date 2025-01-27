<template>
  <v-col
    v-if="voyage && voyageSlug"
    cols="12"
    md="4"
  >
    <NuxtLink
      :to="`/destinations/${voyage.slug}`"
      class="text-decoration-none"
    >
      <v-card
        class="mx-auto"
        max-width="400"
        elevation="0"
      >
        <v-img
          height="220"
          :src="voyage.imgSrc"
          :alt="`Image principale du voyage ${voyage.title}`"
          rounded="lg"
          cover
        >
          <div class="d-flex justify-end ga-1 mt-4 mr-1">
            <v-tooltip
              location="bottom"
              text="Test tooltip"
            >
              <template #activator="{ on }">
                <v-btn
                  v-bind="on"
                  size="x-small"
                  icon
                  color="rgba(0, 0, 0, 0.39)"
                >
                  <v-icon
                    icon="mdi-account-group"
                    color="white"
                  />
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              location="bottom"
              text="Test tooltip"
            >
              <template #activator="{ on }">
                <v-btn
                  size="x-small"
                  icon
                  color="rgba(0, 0, 0, 0.39)"
                  v-bind="on"
                >
                  <v-img
                    src="../../public/icons/child.svg"
                    alt="Child icon"
                    class="svg-child-icon"
                  />
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </v-img>
        <v-hover>
          <template #default="{ isHovering, on }">
            <v-card-text class="font-weight-bold pa-2 d-flex align-center">
              <v-btn
                variant="plain"
                v-bind="on"
                :to="`/destinations/${voyage.country}`"
                :class="isHovering ? 'text-decoration-underline text-primary' : 'text-decoration-none '"
                class="pa-0"
              >
                <span class="text-primary">
                  {{ voyage.country }}
                </span>
              </v-btn>
              <span class="text-secondary"> - {{ voyage.duration }}</span>
            </v-card-text>
          </template>
        </v-hover>
        <v-card-title class="text-body-1 font-weight-bold pa-2">
          {{ voyage.title }}
        </v-card-title>
        <v-card-text class="text-body-2 pa-2">
          <span class="text-grey-darken-2"> A partir de </span>
          <span class="font-weight-bold">{{ voyage.startingPrice }}€</span>
        </v-card-text>
        <v-card-text
          class="d-flex align-center px-2"
          :class="voyage.comments > 0 ? '' : 'd-none'"
        >
          <v-rating
            half-increments
            :size="24"
            :model-value="voyage.rating"
            readonly
            color="orange-lighten-1"
          />({{ voyage.comments }})
        </v-card-text>
      </v-card>
    </NuxtLink>
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
.svg-child-icon {
    width: 1rem;
    height: 1rem;
}
</style>
