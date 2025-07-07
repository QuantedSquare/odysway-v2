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
        color="white"
        block
        class="text-caption text-sm-subtitle-2"
        @click="() => { router.push('/a-propos'); captureOutboundLink(header.textButton1) }"
      >
        {{ header.textButton1 }}
      </v-btn-secondary>
      <v-btn-secondary
        href="tel: +33184807975"
        color="primary"
        variant="tonal"
        block
        class="text-caption text-sm-subtitle-2"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.textButton2) }"
      >
        {{ header.textButton2 }}
      </v-btn-secondary>
      <v-btn-secondary
        block
        class="text-caption text-sm-subtitle-2"
        color="primary"
        @click="() => { router.push('/calendly'); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.textButton3) }"
      >
        {{ header.textButton3 }}
      </v-btn-secondary>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
const model = defineModel()
const { header } = useAppConfig()
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
