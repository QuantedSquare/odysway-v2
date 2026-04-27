<template>
  <v-container
    class="height-title bg-primary  mb-6 mb-md-10"
    fluid
  >
    <v-row
      v-if="skipperMode !== 'devis'"
      justify="center"
    >
      <v-col
        cols="12"
        md="8"
        class="d-flex align-center justify-start flex-md-row px-md-10"
      >
        <SanityImage
          v-if="isSanityImage"
          :asset-id="image"
          auto="format"
          class="d-none d-md-block"
        >
          <template #default="{ src }">
            <v-avatar
              :image="src"
              size="50"
              rounded="lg"
            />
          </template>
        </SanityImage>
        <v-avatar
          v-else
          class="d-none d-md-block"
          :image="image || 'https://odysway.com/logos/logo_noir.png'"
          size="70"
          rounded="md"
        />
        <div
          v-if="stepDefinitions && skipperMode !== 'summary'"
          class="d-flex align-center w-100 px-4"
        >
          <template
            v-for="(step, index) in stepDefinitions"
            :key="step.number"
          >
            <div class="d-flex flex-column align-center">
              <div
                class="step-circle d-flex align-center justify-center rounded-circle text-caption font-weight-bold "
                :class="{
                  'step-complete': currentStep > step.number,
                  'step-active': currentStep === step.number,
                  'step-pending': currentStep < step.number,
                }"
              >
                <v-icon
                  v-if="currentStep > step.number"
                  size="14"
                >
                  {{ mdiCheck }}
                </v-icon>
                <span
                  v-else
                  class="text-subtitle-2 font-weight-bold"
                >{{ index + 1 }}</span>
              </div>
              <span
                class="text-caption text-white mt-2 text-center step-label text-no-wrap"
                :class="currentStep === step.number ? 'text-white' : 'text-grey-custom'"
              >{{ step.label }}</span>
            </div>
            <div
              v-if="index < stepDefinitions.length - 1"
              class="step-line flex-grow-1 mx-2"
            />
          </template>
        </div>
      </v-col>
    </v-row>

    <!-- Mobile info strip -->
    <v-row
      v-if="voyage && dynamicDealValues"
      class="d-flex d-md-none px-4 py-2 align-center mt-4 bg-custom-surface rounded-md"
      no-gutters
    >
      <v-col
        cols="7"
        sm="8"
        class="d-flex flex-column"
      >
        <span class="text-body-2 font-weight-medium text-white text-truncate py-1">
          {{ voyage.title }}
        </span>
        <span
          v-if="voyage.departureDate && voyage.returnDate"
          class="text-caption"
          style="color:rgba(255,255,255,0.7)"
        >
          {{ dayjs(voyage.departureDate).format('DD') }} → {{ dayjs(voyage.returnDate).format('DD MMMM YYYY') }}
        </span>
      </v-col>

      <v-col
        cols="5"
        sm="4"
        class="d-flex align-center justify-end pa-0"
      >
        <v-btn
          variant="text"
          size="small"
          color="white"
          height="40"
          class="price-btn text-subtitle-2 font-weight-bold text-yellow px-2"
          @click="drawerOpen = !drawerOpen"
        >
          <span class="text-yellow">
            {{ formatNumber(drawerRef?.appliedPrice ?? 0, 'currency', '€') }}
          </span>
          <v-icon
            :class="{ 'chevron-open': drawerOpen }"
            class="chevron-icon ml-1"
            size="20"
          >
            {{ mdiChevronDown }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <FunnelStepsSummaryDrawer
      v-if="voyage && dynamicDealValues && pageTexts"
      ref="drawerRef"
      v-model="drawerOpen"
      :voyage="voyage"
      :page-texts="pageTexts"
      :dynamic-deal-values="dynamicDealValues"
      :current-step="currentStep || 1"
    />

    <!-- Mobile info strip (devis flow) -->
    <v-row
      v-if="skipperMode === 'devis' && voyage"
      class="d-flex d-md-none px-4 py-4 align-center bg-custom-surface rounded-md"
      no-gutters
    >
      <v-col
        cols="8"
        class="d-flex flex-column"
      >
        <span class="text-body-2 font-weight-medium text-white text-truncate py-1">
          {{ voyage.title }}
        </span>
        <span
          class="text-caption"
          style="color:rgba(255,255,255,0.7)"
        >
          {{ travelType || 'Voyage individuel' }}
        </span>
      </v-col>

      <v-col
        cols="4"
        class="d-flex flex-column align-end pa-0"
      >
        <span class="text-subtitle-1 font-weight-bold text-yellow">
          {{ formatNumber((voyage.pricing?.startingPrice || 0) * 100, 'currency', '€') }}
        </span>
        <span
          class="text-caption"
          style="color:rgba(255,255,255,0.7)"
        >
          /pers. indicatif
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { mdiCheck, mdiChevronDown } from '@mdi/js'
import formatNumber from '@/utils/formatNumber'

dayjs.locale('fr')

const { voyage, dynamicDealValues, pageTexts } = defineProps({
  titre: String,
  image: String,
  travelType: String,
  date: String,
  price: [String, Number],
  currentStep: Number,
  stepDefinitions: Array,
  skipperMode: {
    type: String,
    default: 'quick',
  },
  isSanityImage: {
    type: Boolean,
    default: false,
  },
  voyage: Object,
  dynamicDealValues: Object,
  pageTexts: Object,
})

const drawerOpen = ref(false)
const drawerRef = useTemplateRef('drawerRef')
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  max-height:50px!important;
}
.step-circle {
  width: 34px;
  height: 34px;
  color:rgba(255,255,255,0.35);
  background-color: rgba(255,255,255,0.3)!important;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
  flex-shrink: 0;
}
.step-active {
  background-color: white!important;
  color: rgb(var(--v-theme-primary));
  border-color: white;
}
.step-complete {
  background-color: white!important;
  color: rgb(51, 150, 168);
  box-shadow: none!important;
  border-color: white;
}
.step-pending {
  background-color: transparent;
  opacity: 0.6;

}
.step-line {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.4);
  min-width: 16px;
}
.step-label {
  max-width: 72px;
  white-space: normal;
  line-height: 1.2;
}
.text-grey-custom{
  color:rgba(255,255,255,0.35)!important;
}
.bg-custom-surface{
  background-color: rgba(255,255,255,0.12);
}
.price-btn :deep(.v-btn__content) {
  display: flex;
  align-items: center;
}
.chevron-icon {
  transition: transform 0.2s ease;
}
.chevron-open {
  transform: rotate(180deg);
}
</style>
