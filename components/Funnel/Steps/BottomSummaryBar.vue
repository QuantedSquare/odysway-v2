<template>
  <div>
    <v-app-bar
      v-if="!drawer"
      location="bottom"
      height="100"
      class="d-md-none elevation-0  "
    >
      <v-container class="py-0 px-0 ">
        <v-row
          no-gutters
        >
          <v-col
            cols="12"
            class="d-flex align-center justify-center "
          >
            <v-btn
              :icon="mdiChevronUp"
              variant="outlined"
              rounded="circle"
              height="35"
              width="35"
              color="white"
              class=" bg-secondary font-weight-bold  negative-margin"
              @click="drawer = true"
            />
          </v-col>
        </v-row>
        <v-row
          class="px-4 elevation-2 py-0 "
        >
          <v-col
            cols="5"
            class="d-flex flex-column align-start justify-center "
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
              variant="text"
              rounded="md"
              color="secondary"
              class="text-body-1 font-weight-bold text-decoration-none"
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
import { mdiClose, mdiChevronUp } from '@mdi/js'
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
defineExpose({
  totalValueFromSummary,
})
</script>

<style scoped>
.bottom-app-bar{
  z-index: 1020 !important;
  min-height: 80px;
}
.custom-height:deep(.v-navigation-drawer) {
  min-height: 75vh !important;
}
.negative-margin{
  margin-bottom: -30px;
}
</style>
