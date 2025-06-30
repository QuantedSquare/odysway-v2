<template>
  <div
    class="d-sm-none px-4 px-md-9 d-flex align-center height-app-bar custom-app-bar bg-white"
    :class="!model ? 'app-bar-shadow' : ''"
  >
    <NuxtLink
      :to="header.to"
      class="header-logo-link"
    >
      <NuxtImg
        preload
        format="webp"
        quality="100"
        :src="LogoOdyswayBleu"
        width="320"
        alt="Logo principale d'Odysway"
        class="header-logo"
      />
    </NuxtLink>

    <v-spacer />
    <div class="d-flex align-center ga-4">
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push('/a-propos'); captureOutboundLink(header.textButton1) }"
      >
        {{ header.textButton1 }}
      </v-btn>
      <v-btn
        color="primary"
        variant="tonal"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.textButton2) }"
      >
        {{ header.textButton2 }}
      </v-btn>
      <v-btn
        density="compact"
        size="x-large"
        height="45"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
        @click="() => { router.push('/calendly'); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.textButton3) }"
      >
        {{ header.textButton3 }}
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
    elevation="0"
    mobile
    class="d-header-desktop px-4 px-md-9 d-flex align-center height-app-bar mx-0"
    :class="!model ? 'app-bar-shadow' : ''"
    :scroll-behavior="scrollBehavior"
    :scroll-threshold="scrollThreshold"
  >
    <NuxtLink
      :to="header.to"
      class="header-logo-link"
    >
      <NuxtImg
        preload
        format="webp"
        quality="100"
        :src="LogoOdyswayBleu"
        width="320"
        alt="Logo principale d'Odysway"
        class="header-logo"
      />
    </NuxtLink>

    <v-spacer />
    <div class="d-flex align-center ga-4">
      <v-btn
        color="primary"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push('/a-propos'); captureOutboundLink(header.textButton1) }"
      >
        {{ header.textButton1 }}
      </v-btn>
      <v-btn
        color="primary"
        variant="tonal"
        height="45"
        href="tel: +33184807975"
        class="text-caption text-md-body-1 d-none d-md-flex align-center"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.textButton2) }"
      >
        {{ header.textButton2 }}
      </v-btn>
      <v-btn
        density="compact"
        size="x-large"
        height="45"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
        @click="() => { router.push('/calendly'); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.textButton3) }"
      >
        {{ header.textButton3 }}
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
// import { useDisplay } from 'vuetify'
import LogoOdyswayBleu from '~/assets/img/Logo-Odysway-Bleu.png'

const { header } = useAppConfig()

const router = useRouter()
const model = defineModel()
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
</style>
