<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        class="font-weight-black text-h4"
      >
        {{ priceDetailsSection.title }}
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-list>
          <v-list-subheader class="text-subtitle-1 pt-md-4 custom-padding">
            <v-chip
              variant="flat"
              color="green"
              density="compact"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceInclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container class="px-0">
            <PriceDetailsItem
              v-for="item, index in pricingDetailsBlock.include"
              :key="index"
              is-included
              :text="item"
            />
          </v-container>
        </v-list>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="pl-md-4">
          <v-list-subheader class="text-subtitle-1 pt-md-4 custom-padding">
            <v-chip
              variant="flat"
              color="secondary"
              density="compact"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceExclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container class="px-0">
            <PriceDetailsItem
              v-for="item, index in pricingDetailsBlock.exclude"
              :key="index"
              :text="item"
            />
          </v-container>
        </v-list>
      </v-col>
    </v-row>
    <v-divider class="my-6" />
  </v-container>
</template>

<script setup>
// import { useDisplay } from 'vuetify'

// const { width } = useDisplay()

defineProps({
  pricingDetailsBlock: {
    type: Object,
    required: true,
  },
  priceDetailsSection: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.custom-padding {
  padding-left: 0 !important;
}
</style>
