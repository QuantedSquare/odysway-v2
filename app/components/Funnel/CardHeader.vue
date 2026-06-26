<template>
  <v-container
    class="height-title bg-primary  mb-6 mb-md-10 pt-0 pt-md-4"
    fluid
  >
    <v-row
      v-if="skipperMode !== 'devis'"
      justify="center"
      class="d-none d-md-flex"
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

    <!-- Mobile voyage card (Airbnb-style hero) -->
    <div
      v-if="voyage && dynamicDealValues"
      class="d-md-none mobile-voyage-card overflow-hidden"
    >
      <div class="mobile-hero">
        <v-img
          :src="image || 'https://odysway.com/logos/logo_noir.png'"
          cover
          height="240"
          class="mobile-hero-img"
        />
        <div class="mobile-hero-overlay" />

        <!-- Stepper overlaid on the image -->
        <div
          v-if="stepDefinitions && skipperMode !== 'summary'"
          class="mobile-hero-steps d-flex align-center"
        >
          <template
            v-for="(step, index) in stepDefinitions"
            :key="step.number"
          >
            <div class="d-flex flex-column align-center">
              <div
                class="step-circle d-flex align-center justify-center rounded-circle text-caption font-weight-bold"
                :class="{
                  'step-complete': currentStep > step.number,
                  'step-active': currentStep === step.number,
                  'step-pending': currentStep < step.number,
                }"
              >
                <v-icon
                  v-if="currentStep > step.number"
                  size="13"
                >
                  {{ mdiCheck }}
                </v-icon>
                <span
                  v-else
                  class="text-caption font-weight-bold"
                >{{ index + 1 }}</span>
              </div>
              <span
                class="text-caption text-white mt-1 text-center step-label text-no-wrap"
                :class="currentStep === step.number ? 'text-white font-weight-medium' : 'text-grey-custom'"
              >{{ step.label }}</span>
            </div>
            <div
              v-if="index < stepDefinitions.length - 1"
              class="step-line flex-grow-1 mx-2"
            />
          </template>
        </div>

        <div class="mobile-hero-caption d-flex align-end justify-space-between">
          <div
            class="flex-grow-1 mr-3"
            style="min-width:0"
          >
            <span class="text-h6 font-weight-bold text-white d-block text-truncate">
              {{ voyage.title }}
            </span>
            <span
              v-if="voyage.departureDate && voyage.returnDate"
              class="text-caption text-white d-flex align-center mt-1"
              style="opacity:0.95"
            >
              <v-icon
                size="14"
                class="mr-1"
              >
                {{ mdiCalendarBlankOutline }}
              </v-icon>
              {{ dayjs(voyage.departureDate).format('DD') }} → {{ dayjs(voyage.returnDate).format('DD MMMM YYYY') }}
            </span>
          </div>

          <!-- Frosted price pill -->
          <div class="mobile-price-pill">
            <span class="mobile-price-pill__label">À régler maintenant</span>
            <span class="mobile-price-pill__amount text-no-wrap">
              {{ formatNumber(drawerRef?.appliedPrice ?? 0, 'currency', '€') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <FunnelStepsSummaryDrawer
      v-if="voyage && dynamicDealValues && pageTexts"
      ref="drawerRef"
      v-model="drawerOpen"
      :voyage="voyage"
      :page-texts="pageTexts"
      :dynamic-deal-values="dynamicDealValues"
      :current-step="currentStep || 1"
    />

    <!-- Mobile voyage card (devis flow, Airbnb-style hero) -->
    <div
      v-if="skipperMode === 'devis' && voyage"
      class="d-md-none mobile-voyage-card overflow-hidden"
    >
      <div class="mobile-hero">
        <v-img
          :src="image || 'https://odysway.com/logos/logo_noir.png'"
          cover
          height="210"
          class="mobile-hero-img"
        />
        <div class="mobile-hero-overlay" />

        <!-- Frosted price pill -->
        <div class="mobile-price-pill mobile-price-pill--float">
          <span class="mobile-price-pill__label">À partir de</span>
          <span class="mobile-price-pill__amount text-no-wrap">
            {{ formatNumber((voyage.pricing?.startingPrice || 0) * 100, 'currency', '€') }}
            <small class="font-weight-regular">{{ pageTexts?.navigation?.price_per_person_suffix || "/pers." }}</small>
          </span>
        </div>

        <div class="mobile-hero-caption">
          <span class="text-h6 font-weight-bold text-white d-block text-truncate">
            {{ voyage.title }}
          </span>
          <span
            class="text-caption text-white"
            style="opacity:0.95"
          >
            {{ travelType || 'Voyage individuel' }}
          </span>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { mdiCheck, mdiChevronDown, mdiCalendarBlankOutline } from '@mdi/js'
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
.mobile-voyage-card {
  /* full-bleed: cancel the v-container horizontal padding */
  margin-top: 12px;
  margin-left: -16px;
  margin-right: -16px;
  margin-bottom: -16px;
}
.mobile-hero {
  position: relative;
}
.mobile-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.55) 0%,
    rgba(0,0,0,0.12) 24%,
    rgba(0,0,0,0) 48%,
    rgba(0,0,0,0.78) 100%
  );
  pointer-events: none;
}
.mobile-hero-steps {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 14px 20px 0;
}
.mobile-hero-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 16px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.45);
}
.mobile-price-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  text-shadow: none;
}
.mobile-price-pill--float {
  position: absolute;
  top: 14px;
  right: 16px;
}
.mobile-price-pill__label {
  font-size: 0.6rem;
  line-height: 1;
  letter-spacing: 0.02em;
  color: rgba(0,0,0,0.55);
}
.mobile-price-pill__amount {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-primary));
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
