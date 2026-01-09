<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="model"
      location="right"
      disable-resize-watcher
      mobile
      :style="drawerStyle"
      :class="[
        'custom-padding',
        isTransparent ? 'drawer-transparent' : 'drawer-solid',
      ]"
    >
      <div
        class="d-flex flex-column ga-4 pa-4 mt-10"
        :style="drawerContentStyle"
      >
        <div class="d-flex justify-center">
          <SearchDialog
            v-if="route.path !== '/'"
          />
        </div>
        <v-btn-secondary
          v-if="header?.button5?.visible"
          block
          class="text-caption text-sm-subtitle-2"
          color="primary"
          @click="() => { router.push(header.button5.link); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.button5.text) }"
        >
          {{ header.button5.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button4?.visible"
          href="tel: +33184807975"
          block
          :variant="isTransparent ? 'flat' : 'tonal'"
          class="text-caption text-sm-subtitle-2 text-primary"
          :color="isTransparent ? 'white' : 'primary'"
          @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.button4.text) }"
        >
          {{ header.button4.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button3?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="() => { router.push(header.button3.link); captureOutboundLink(header.button3.text) }"
        >
          {{ header.button3.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button2?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="() => { router.push(header.button2.link); captureOutboundLink(header.button2.text) }"
        >
          {{ header.button2.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button1?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="() => { router.push(header.button1.link); captureOutboundLink(header.button1.text) }"
        >
          {{ header.button1.text }}
        </v-btn-secondary>
      </div>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup>
import { useWindowScroll } from '@vueuse/core'

const model = defineModel({ type: Boolean, default: false })

const { header } = defineProps({
  header: {
    type: Object,
    required: true,
  },
})
const router = useRouter()
const { gtag } = useGtag()
const route = useRoute()
const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 200)
const isTransparent = computed(() => !isScrolled.value && route.path === '/')

const headerTopOffset = ref(0)
const headerHeight = ref(0)

function updateHeaderMetrics() {
  // HeaderOdysway mobile wrapper uses this class
  const el = document?.querySelector?.('.mobile-header')
  if (!el) {
    headerTopOffset.value = 0
    headerHeight.value = 0
    return
  }

  const rect = el.getBoundingClientRect()
  headerTopOffset.value = Math.max(0, Math.round(rect.top))
  headerHeight.value = Math.max(0, Math.round(rect.height))
}

const drawerStyle = computed(() => {
  // Align the drawer panel with the floating header top border
  const top = headerTopOffset.value
  return {
    top: `${top}px`,
    height: `calc(100dvh - ${top}px)`,
  }
})

const drawerContentStyle = computed(() => {
  // Push content below the header height so it visually matches the header top border
  // (pa-4 already adds padding; we only add the extra header height here)
  return {
    paddingTop: `${headerHeight.value}px`,
  }
})

onMounted(() => {
  updateHeaderMetrics()
  window.addEventListener('scroll', updateHeaderMetrics, { passive: true })
  window.addEventListener('resize', updateHeaderMetrics, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateHeaderMetrics)
  window.removeEventListener('resize', updateHeaderMetrics)
})

watch(model, (isOpen) => {
  if (isOpen) updateHeaderMetrics()
})

watch(y, () => updateHeaderMetrics())

function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
</script>

<style scoped>
.custom-padding{
  padding-bottom: 100px;
}
.drawer-solid {
  background: white !important;
}
.drawer-transparent {
  background: rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(3px) !important;
  border: 1px solid rgba(255, 255, 255, 0.404)
}
@media (max-width: 600px) {
  .custom-padding{
    padding-top: 0px;
  }
}
.drawer-shadow{
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
