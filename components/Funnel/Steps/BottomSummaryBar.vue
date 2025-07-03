<template>
  <div>
    <v-app-bar
      v-if="!drawer"
      location="bottom"
      class="d-md-none pb-1 pb-sm-0 bottom-app-bar"
    >
      <v-container class="py-0">
        <v-row
          no-gutters
          class="mx-4"
        >
          <v-col
            cols="5"
            class="d-flex flex-column align-start justify-center"
          >
            <span class="text-caption text-grey">
              Total:
            </span>
            <span class="text-h4 font-weight-bold text-primary">
              {{ formatNumber(totalValueFromSummary, 'currency', 'EUR') }}
            </span>
          </v-col>
          <v-spacer class="d-block" />
          <v-col
            cols="6"
            class="d-flex align-center justify-end"
          >
            <v-btn-secondary
              density="compact"
              height="50"
              width="120"
              rounded="md"
              color="secondary"
              class="text-body-2 font-weight-bold text-decoration-none"
              @click="drawer = true"
            >
              Voir plus
            </v-btn-secondary>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <div :class="drawer ? 'custom-height' : ''">
      <v-navigation-drawer
        v-model="drawer"
        location="bottom"
        temporary
        disable-resize-watcher
        mobile

        class="d-block rounded-t-lg d-md-none "
      >
        <v-container>
          <div class="pa-4  position-sticky top-0 d-flex justify-space-between align-center mb-4 z-100">
            <h3 class="text-h6 font-weight-bold">
              Récapitulatif du prix
            </h3>
            <v-btn
              icon
              variant="text"
              @click="drawer = false"
            >
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </div>

          <FunnelStepsSummary
            v-if="voyage && pageTexts"
            ref="summaryRef"
            v-model="localDynamicDealValues"
            :current-step="currentStep"
            :page="pageTexts"
            :voyage="voyage"
            :own-step="5"
          />
          <v-btn
            block
            color="secondary"
            class="mt-12 text-body-2 border  border-white font-weight-bold text-decoration-none"
            @click="drawer = false"
          >
            Fermer
          </v-btn>
        </v-container>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import formatNumber from '@/utils/formatNumber'

const summaryRef = useTemplateRef('summaryRef')
const drawer = ref(false)

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
  pageTexts: {
    type: Object,
    required: true,
  },
  voyage: {
    type: Object,
    required: true,
  },
  dynamicDealValues: {
    type: Object,
    required: true,
  },
})
const localDynamicDealValues = computed({
  get: () => props.dynamicDealValues,
  set: () => {}, // Read-only in the drawer
})

// Access the totalValue from the summary component via ref
const totalValueFromSummary = computed(() => {
  return summaryRef.value?.totalValue || 0
})
</script>

<style scoped>
.bottom-app-bar{
  z-index: 1020 !important;
}
.custom-height:deep(.v-navigation-drawer) {
  min-height: 75vh !important;
}
.z-100 {
  z-index: 100 !important;
}
</style>
