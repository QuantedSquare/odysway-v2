<template>
  <div :class="modelValue ? 'custom-height' : ''">
    <v-navigation-drawer
      :model-value="modelValue"
      location="bottom"
      temporary
      disable-resize-watcher
      mobile
      class="d-block rounded-t-lg d-md-none"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <v-container>
        <div class="pa-4 position-sticky top-0 d-flex justify-space-between align-center mb-4 z-100">
          <h3 class="text-h6 font-weight-bold">
            Récapitulatif du prix
          </h3>
          <v-btn
            icon
            variant="text"
            @click="$emit('update:modelValue', false)"
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
          class="mt-12 text-body-2 border border-white font-weight-bold text-decoration-none"
          @click="$emit('update:modelValue', false)"
        >
          Fermer
        </v-btn>
      </v-container>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { mdiClose } from '@mdi/js'

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
  modelValue: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const summaryRef = useTemplateRef('summaryRef')

const localDynamicDealValues = computed({
  get: () => props.dynamicDealValues,
  set: () => {},
})

const totalValue = computed(() => summaryRef.value?.totalValue || 0)
const appliedPrice = computed(() => summaryRef.value?.appliedPrice || 0)

defineExpose({ totalValue, appliedPrice })
</script>

<style scoped>
.custom-height:deep(.v-navigation-drawer) {
  min-height: 75vh !important;
}
</style>
