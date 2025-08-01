<template>
  <div
    v-if="header"
    class="d-sm-none px-4 px-md-9 d-flex align-center height-app-bar custom-app-bar bg-white"
    :class="!model ? 'app-bar-shadow' : ''"
  >
    <NuxtLink
      :to="header.logo.to || '/'"
      class="header-logo-link"
    >
      <NuxtImg
        preload
        as="image"
        format="webp"
        quality="100"
        :src="logo"
        width="320"
        :alt="header.logo.alt || 'Logo principale d\'Odysway'"
        class="header-logo"
      />
    </NuxtLink>

    <v-spacer />
    <div class="d-flex align-center ga-4">
      <v-btn
        height="45"
        color="primary"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button1.link); captureOutboundLink(header.button1.text) }"
      >
        {{ header.button1.text }}
      </v-btn>
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button2.link); captureOutboundLink(header.button2.text) }"
      >
        {{ header.button2.text }}
      </v-btn>
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button3.link); captureOutboundLink(header.button3.text) }"
      >
        {{ header.button3.text }}
      </v-btn>
      <v-btn
        href="tel: +33184807975"
        color="primary"
        height="45"
        variant="tonal"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.button3.text) }"
      >
        <span class="mt-2">{{ header.button4.text }}</span>
      </v-btn>
      <v-btn
        height="45"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
        @click="() => { router.push(header.button4.link); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.button4.text) }"
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
  </div>
  <v-app-bar
    v-if="header"
    elevation="0"
    mobile
    class="d-header-desktop px-4 px-md-9 d-flex align-center height-app-bar mx-0"
    :class="!model ? 'app-bar-shadow' : ''"
    :scroll-behavior="scrollBehavior"
    :scroll-threshold="scrollThreshold"
  >
    <NuxtLink
      :to="header.logo.to || '/'"
      class="header-logo-link"
    >
      <NuxtImg
        preload
        as="image"
        format="webp"
        quality="100"
        :src="logo"
        width="320"
        :alt="header.logo.alt || 'Logo principale d\'Odysway'"
        class="header-logo"
      />
    </NuxtLink>

    <v-spacer />
    <div class="d-flex align-center ga-4">
      <v-btn
        height="45"
        color="primary"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button1.link); captureOutboundLink(header.button1.text) }"
      >
        {{ header.button1.text }}
      </v-btn>
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button2.link); captureOutboundLink(header.button2.text) }"
      >
        {{ header.button2.text }}
      </v-btn>
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push(header.button3.link); captureOutboundLink(header.button3.text) }"
      >
        {{ header.button3.text }}
      </v-btn>
      <v-btn
        href="tel: +33184807975"
        color="primary"
        height="45"
        variant="tonal"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.button4.text) }"
      >
        <span class="mt-2">{{ header.button4.text }}</span>
      </v-btn>
      <v-btn
        height="45"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
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
  </v-app-bar>
</template>

<script setup>
import { mdiMenu } from '@mdi/js'
import { useDisplay } from 'vuetify'

const router = useRouter()
const model = defineModel()
const { sm } = useDisplay()

defineProps({
  scrollBehavior: {
    type: String,
    default: 'elevate',
  },
  scrollThreshold: {
    type: Number,
    default: 5,
  },
})

const { data: header } = await useAsyncData('header', () => {
  return queryCollection('header').first()
})

const logo = computed(() => {
  if (!header.value?.logo) return '/logos/Logo-Odysway-Bleu.png'
  return sm.value ? header.value.logo.mobile : header.value.logo.desktop
})

const { gtag } = useGtag()
function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
</script>

<style scoped>
.d-header-desktop{
  display: none!important;
}
@media (min-width: 600px) {
  .d-header-desktop{
    display: block!important;
  }
}
.custom-app-bar{
  position: fixed !important;
  top: 0;
  left: 0;
  margin-left: 16px;
  margin-right: 16px;
  width: calc(100% - 36px);
  right: 0;
  z-index: 1999!important;
}
.app-bar-shadow:deep(){
  box-shadow: none!important;
  z-index: 1999!important;
}
.height-app-bar{
  height: 90px;
}
.header-logo-link {
  display: flex;
  align-items: center;
}
:deep(.v-toolbar__content){
  height: 100%!important;
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
  .app-bar-shadow:deep(){
    box-shadow: 0px 10px 20px 0px #0000000A!important;
  }
  .header-logo {
    width: 100px;
    min-width: 60px;
    height: 25px;

  }
  .height-app-bar{
  height: 60px;
}
}
@media (max-width: 600px) {
  .height-app-bar{
    height:52px;
    margin-top: 18px;
    border-radius: 12px!important;
    box-shadow: 0px 10px 20px 0px #0000000A!important;
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
</style>
