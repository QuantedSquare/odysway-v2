<template>
  <div
    class="d-sm-none px-4 px-md-9 d-flex align-center height-app-bar custom-app-bar mobile-header"
    :class="{
      'app-bar-shadow': !model,
      'transparent-app-bar': isTransparent,
      'white-app-bar': !isTransparent,
    }"
  >
    <NuxtLink
      :to="'/'"
      class="header-logo-link mobile-logo"
    >
      <img
        :src="img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 110 })"
        :srcset="`${img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 110 })} 110w, ${img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 130 })} 130w`"
        sizes="110px"
        width="110"
        height="30"
        fetchpriority="high"
        :alt="header?.logo?.alt || 'Logo principale d\'Odysway'"
        class="header-logo"
      >
    </NuxtLink>
    <v-btn
      class="d-inline d-md-none mobile-menu-btn"
      :class="isTransparent ? 'filter' : ''"
      icon
      height="35"
      variant="text"
      aria-label="Menu"
      :aria-expanded="model"
      @click.stop="model = !model"
    >
      <v-icon>
        {{ mdiMenu }}
      </v-icon>
    </v-btn>
  </div>
  <v-app-bar
    elevation="0"
    mobile
    class="d-header-desktop height-app-bar-desktop px-4 px-md-9 d-flex align-center  mx-0 "
    extended
    :class="isTransparent ? 'transparent-app-bar' : 'bg-white'"
    scroll-behavior="fully-hide"
    scroll-threshold="20"
    extension-height="90"
  >
    <template #extension>
      <NuxtLink
        :to="'/'"
        class="header-logo-link"
        :class="isTransparent ? 'filter' : ''"
      >
        <img
          :src="img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 150 })"
          :srcset="`${img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 150 })} 150w, ${img(`/logos/Logo-Odysway-${isTransparent ? 'Blanc' : 'Bleu'}.png`, { format: 'webp', quality: 90, width: 180 })} 180w`"
          sizes="150px"
          width="150"
          height="38"
          fetchpriority="high"
          :alt="header?.logo?.alt || 'Logo principale d\'Odysway'"
          class="header-logo"
          style="width: 150px; height: auto; max-width: 150px;"
        >
      </NuxtLink>
      <v-spacer />

      <div
        class="d-flex align-center"
        :class="isTransparent ? '' : 'ga-'"
      >
        <SearchDialog v-if="route.path !== '/'" />
        <v-btn
          v-if="header?.button1?.visible"
          height="45"
          color="primary"
          rounded="default"
          class="text-caption text-md-body-1 d-none d-md-inline"
          :class="isTransparent ? 'filter' : ''"
          @click="() => { router.push(header.button1.link); captureOutboundLink(header.button1.text) }"
        >
          {{ header.button1.text }}
        </v-btn>
        <v-btn
          v-if="header?.button2?.visible"
          color="primary"
          height="45"
          :class="isTransparent ? 'filter' : ''"
          class="text-caption text-md-body-1 d-none d-md-inline"
          @click="() => { router.push(header.button2.link); captureOutboundLink(header.button2.text) }"
        >
          {{ header.button2.text }}
        </v-btn>
        <v-btn
          v-if="header?.button3?.visible"
          color="primary"
          height="45"
          :class="isTransparent ? 'filter' : ''"
          class="text-caption text-md-body-1 d-none d-md-inline"
          @click="() => { router.push(header.button3.link); captureOutboundLink(header.button3.text) }"
        >
          {{ header.button3.text }}
        </v-btn>
        <v-btn
          v-if="header?.button4?.visible"
          href="tel: +33184807975"
          color="primary"
          height="45"
          :variant="isTransparent ? 'text' : 'tonal'"
          :class="isTransparent ? 'filter' : ''"

          class="text-caption text-md-body-1 d-none d-md-flex"
          @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.button4.text) }"
        >
          <span class="align-center">{{ header.button4.text }}</span>
        </v-btn>
        <v-btn
          v-if="header?.button5?.visible"
          height="45"
          :variant="isTransparent ? 'text' : 'tonal'"
          :class="isTransparent ? 'text-soft-blush text-shadow' : 'bg-primary text-white ml-3'"
          class="text-caption text-md-body-1 d-none d-md-inline "
          @click="() => { router.push(header.button5.link); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.button5.text) }"
        >
          {{ header.button5.text }}
        </v-btn>

        <v-btn
          class="d-inline d-md-none "
          icon
          height="35"
          variant="text"
          aria-label="Menu"
          :aria-expanded="model"
          @click.stop="model = !model"
        >
          <v-icon>
            {{ mdiMenu }}
          </v-icon>
        </v-btn>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup>
import { mdiMenu } from '@mdi/js'
import { useWindowScroll } from '@vueuse/core'
import { useImage } from '#imports'

const router = useRouter()
const model = defineModel({ type: Boolean, default: false })
const img = useImage()
const route = useRoute()

const { y } = useWindowScroll()

const { header } = defineProps({
  header: {
    type: Object,
    required: true,
  },
})

const { gtag } = useGtag()
function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
const isScrolled = computed(() => y.value > 200)
const isTransparent = computed(() => !isScrolled.value && route.path === '/')
</script>

<style scoped>
.d-header-desktop {
  display: none !important;
  transition: all 0.5s ease-in-out !important;
}

@media (min-width: 600px) {
  .d-header-desktop {
    display: flex !important;
  }
}

.custom-app-bar {
  position: fixed !important;
  top: 0;
  left: 0;
  margin-left: 16px;
  margin-right: 16px;
  width: calc(100% - 36px);
  right: 0;
  z-index: 1999 !important;
}

.app-bar-shadow:deep() {
  box-shadow: none !important;
  z-index: 1999 !important;
}

.height-app-bar {
  height: 90px;
  justify-content: center;
  background-color: white !important;
}
.height-app-bar-desktop {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.transparent-app-bar {
  backdrop-filter: blur(3px) !important;
  background-color: rgba(160, 131, 122, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.404)
}
.white-app-bar {
  background-color: white !important;
}

.header-logo-link {
  display: flex;
  align-items: center;
}

:deep(.v-toolbar__content) {
  height: 100% !important;
}

.header-logo {
  width: 150px;
  min-width: 100px;
  max-width: 100%;
  height: auto;
  transition: width 0.2s;
  display: block;
}

@media (max-width: 960px) {
  .app-bar-shadow:deep() {
    box-shadow: 0px 10px 20px 0px #0000000A !important;
  }

  .header-logo {
    width: 100px;
    min-width: 60px;
    height: 25px;

  }

  .height-app-bar {
    height: 60px;
  }
}

@media (max-width: 600px) {
  .height-app-bar {
    height: 52px;
    margin-top: 18px;
    border-radius: 12px !important;
    box-shadow: 0px 10px 20px 0px #0000000A !important;
  }
}

@media (min-width: 960px) and (max-width: 1200px) {
  :deep(.v-btn.text-md-body-1) {
    font-size: 0.9rem !important;
    height: 36px !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}

.filter {
  color: #FBF0EC!important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .2) !important;
}

.mobile-header {
  transition: all 0.5s ease-in-out !important;
  justify-content: start;
  position: fixed !important;
  left: 0;
  right: 0;
}

.mobile-menu-btn {
  position: absolute;
  right: 12px;
}
</style>
