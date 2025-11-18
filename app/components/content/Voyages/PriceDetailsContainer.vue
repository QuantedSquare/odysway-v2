<template>
  <v-container
    v-if="pricingDetailsBlock?.listInclude?.length > 0 || pricingDetailsBlock?.listExclude?.length > 0"
    fluid
    class="px-0"
  >
    <v-row
      justify="center"
      align="start"
      class="px-2 px-md-0"
    >
      <v-col
        cols="12"
        xs="7"
        class="text-h4 my-2 font-weight-bold "
      >
        {{ priceDetailsSection.title }}
      </v-col>
      <v-spacer />
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
        class="py-0"
      >
        <v-list
          role="list"
          :aria-label="`${priceDetailsSection.priceInclude} de ${priceDetailsSection.title}`"
        >
          <v-list-subheader class="text-subtitle-1 pt-md-4 d-flex justify-center justify-md-start custom-padding">
            <v-chip
              variant="flat"
              color="green"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceInclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container class="px-md-0">
            <EnrichedText
              class="custom-include-list-item"
              :value="pricingDetailsBlock.listInclude"
              :list-aria-attributes="{
                role: 'list',
                'aria-label': `${priceDetailsSection.priceInclude} de ${priceDetailsSection.title}`
              }"
              :list-item-aria-attributes="(index) => ({ 
                role: 'listitem',
                'aria-label': `Item ${index + 1} de ${priceDetailsSection.priceInclude}` 
              })"
            />
          </v-container>
        </v-list>
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="py-0"
      >
        <v-list
          class="pl-md-4"
          role="list"
          :aria-label="`${priceDetailsSection.priceExclude} de ${priceDetailsSection.title}`"
        >
          <v-list-subheader class="text-subtitle-1 pt-md-4 d-flex justify-center justify-md-start custom-padding">
            <v-chip
              variant="flat"
              color="secondary"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceExclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container class="px-md-0">
            <EnrichedText
              class="custom-exclude-list-item"
              :value="pricingDetailsBlock.listExclude"
              :list-aria-attributes="{
                role: 'list',
                'aria-label': `${priceDetailsSection.priceExclude} de ${priceDetailsSection.title}`
              }"
              :list-item-aria-attributes="(index) => ({ 
                role: 'listitem',
                'aria-label': `Item ${index + 1} de ${priceDetailsSection.priceExclude}` 
              })"
            />
          </v-container>
        </v-list>
      </v-col>
    </v-row>
    <v-divider class="my-2 my-md-6" />
  </v-container>
</template>

<script setup>
defineProps({
  pricingDetailsBlock: {
    type: Object,
    default: undefined,
  },
  priceDetailsSection: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.custom-padding {
  padding-inline: 0 !important;
}
.custom-include-list-item:deep(ul) {
  list-style: none!important;
  margin-left: 0;
  padding-left: 1.2em;
}
.custom-exclude-list-item:deep(ul) {
  list-style: none!important;
  margin-left: 0.1em;
  padding-left: 1.2em;
}
.custom-include-list-item:deep(ul li:before) {
  content: url('/assets/include.svg') !important;
  position: absolute;
  left: 0;
  margin-top: 0.2em!important;
}
.custom-exclude-list-item:deep(ul li:before) {
  content: url('/assets/exclude.svg') !important;
  position: absolute;
  left: 10px;
  margin-top: 0.2em!important;
}
.custom-exclude-list-item:deep(ul li), .custom-include-list-item:deep(ul li) {
  margin-left: 0.8em;
}
</style>
