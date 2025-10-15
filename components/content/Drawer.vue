<template>
  <v-navigation-drawer
    v-model="model"
    location="right"
    disable-resize-watcher
    mobile
    class="custom-padding"
  >
    <div class="d-flex flex-column ga-4 pa-4">
      <v-btn-secondary
        block
        class="text-caption text-sm-subtitle-2"
        color="primary"
        @click="() => { router.push(header.button5.link); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.button5.text) }"
      >
        {{ header.button5.text }}
      </v-btn-secondary>
      <v-btn-secondary
        href="tel: +33184807975"
        block
        variant="tonal"
        class="text-caption text-sm-subtitle-2"
        color="primary"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.button4.text) }"
      >
        {{ header.button4.text }}
      </v-btn-secondary>
      <v-btn-secondary
        color="white"
        block
        class="text-caption text-sm-subtitle-2 text-primary"
        @click="() => { router.push(header.button3.link); captureOutboundLink(header.button3.text) }"
      >
        {{ header.button3.text }}
      </v-btn-secondary>
      <v-btn-secondary
        color="white"
        block
        class="text-caption text-sm-subtitle-2 text-primary"
        @click="() => { router.push(header.button2.link); captureOutboundLink(header.button2.text) }"
      >
        {{ header.button2.text }}
      </v-btn-secondary>
      <v-btn-secondary
        color="white"
        block
        class="text-caption text-sm-subtitle-2 text-primary"
        @click="() => { router.push(header.button1.link); captureOutboundLink(header.button1.text) }"
      >
        {{ header.button1.text }}
      </v-btn-secondary>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
const model = defineModel()
const sanity = useSanity()

const headerQuery = groq`*[_type == "header"][0]{
  logo,
  search,
  button1,
  button2,
  button3,
  button4,
  button5
}`

const { data: header } = await useAsyncData('header', () =>
  sanity.fetch(headerQuery),
)
const router = useRouter()
const { gtag } = useGtag()

function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
</script>

<style scoped>
.custom-padding{
  margin-top: -10px;
  padding-top: 10px;
  padding-bottom: 100px;
  height: 100vh!important;
}
@media (max-width: 600px) {
  .custom-padding{
    margin-top: -46px;
    padding-top: 60px;
  }
}
.drawer-shadow{
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
