<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="model"
      location="top"
      disable-resize-watcher
      mobile
      :style="drawerStyle"
      class="drawer-animated"
      :class="[
        isTransparent ? 'drawer-transparent' : 'drawer-solid',
      ]"
    >
      <div
        class="d-flex flex-column ga-4 px-4 pb-4"
        :style="drawerContentStyle"
      >
        <v-btn-secondary
          v-if="header?.button5?.visible"
          block
          class="text-caption text-sm-subtitle-2"
          color="primary"
          @click="handleButton5Click"
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
          @click="handleButton4Click"
        >
          {{ header.button4.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button3?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="handleButton3Click"
        >
          {{ header.button3.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button2?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="handleButton2Click"
        >
          {{ header.button2.text }}
        </v-btn-secondary>
        <v-btn-secondary
          v-if="header?.button1?.visible"
          color="white"
          block
          class="text-caption text-sm-subtitle-2 text-primary"
          @click="handleButton1Click"
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
const route = useRoute()
const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 200)
const isTransparent = computed(() => !isScrolled.value && route.path === '/')

const { trackRdvClick, trackCallClick } = useGtmTracking()
const { scheduleLayoutRead } = useLayoutRead()

const headerTopOffset = ref(0)
const headerHeight = ref(0)

// rAF-throttle the rect read so a fast scroll doesn't trigger
// getBoundingClientRect() once per scroll event (PageSpeed flagged this
// callsite at ~28ms forced reflow). We coalesce repeats into a single
// frame and batch the layout read via useLayoutRead.
let rafScheduled = false
function updateHeaderMetrics() {
  if (rafScheduled) return
  rafScheduled = true
  scheduleLayoutRead(() => {
    rafScheduled = false
    const el = document?.querySelector?.('.mobile-header')
    if (!el) {
      headerTopOffset.value = 0
      headerHeight.value = 0
      return
    }
    const rect = el.getBoundingClientRect()
    headerTopOffset.value = Math.max(0, Math.round(rect.top))
    headerHeight.value = Math.max(0, Math.round(rect.height))
  })
}

const drawerStyle = computed(() => {
  // Keep the panel anchored at the very top (top: 0) so Vuetify's closed
  // translateY(-100%) fully retracts it off-screen. Height is content-driven
  // (auto), capped to the viewport. The header clearance is handled by the
  // content padding below, not by offsetting the panel.
  return {
    height: 'auto',
    maxHeight: '100dvh',
  }
})

const drawerContentStyle = computed(() => {
  // Push the content (first button) below the floating header so it sits just
  // beneath the top bar rather than tucked under it: header top offset +
  // header height + a small gap. Fall back to a sensible static clearance
  // before the metrics are first read.
  const clearance = (headerTopOffset.value || 18) + (headerHeight.value || 52) + 12
  return {
    paddingTop: `${clearance}px`,
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

// Close the drawer when the user scrolls down, mirroring the way the desktop
// app-bar auto-hides on downward scroll.
let lastScrollY = 0
watch(y, (currentY) => {
  if (model.value && currentY > lastScrollY && currentY > 20) {
    model.value = false
  }
  lastScrollY = currentY
})

// `watch(y, …)` was redundant with the scroll listener above and doubled
// the layout work on every scroll event — removed.

function handleButton1Click() {
  router.push(header.button1.link)
}

function handleButton2Click() {
  router.push(header.button2.link)
}

function handleButton3Click() {
  router.push(header.button3.link)
}

function handleButton4Click() {
  trackCallClick('header-mobile')
}

function handleButton5Click() {
  if (header.button5.link.includes('calendly') || header.button5.link.toLowerCase().includes('rdv')) {
    trackRdvClick('header-mobile')
  }

  router.push(header.button5.link)
}
</script>

<style scoped>
.drawer-animated {
  /* Pin to the very top. Vuetify's layout system otherwise reserves space for
     the (mobile-hidden) desktop app-bar and pushes the top drawer down with an
     inline `top: <n>px`; overriding it here with !important places the panel
     correctly. Header clearance is done via content padding instead. */
  top: 0 !important;
  /* Drive both the slide (transform) and the color swap between the transparent
     (home, top of page) and solid states, plus the backdrop blur fade. We
     must re-declare transform here because this rule replaces Vuetify's own
     drawer transition. */
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.4s ease,
    backdrop-filter 0.4s ease,
    border-color 0.4s ease !important;
}
/* When closed, force a full-height retract. Vuetify hardcodes a pixel
   translate from a stale measurement that ignores our dynamic content padding,
   which left the last button peeking below the header. translateY(-100%) is
   always the panel's own full height, so it hides completely. */
.drawer-animated:not(.v-navigation-drawer--active) {
  transform: translateY(-100%) !important;
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

}
.drawer-shadow{
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
