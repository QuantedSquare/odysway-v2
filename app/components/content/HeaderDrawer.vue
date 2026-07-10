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
        class="d-flex flex-column px-4 pb-4"
        :class="isTransparent ? 'drawer-content--transparent' : 'drawer-content--solid'"
        :style="drawerContentStyle"
      >
        <nav
          v-if="navigation.length"
          class="drawer-nav"
          aria-label="Navigation mobile"
        >
          <template
            v-for="(item, i) in navigation"
            :key="i"
          >
            <!-- Item avec sous-liens : panneau dépliable -->
            <div
              v-if="item.children?.length"
              class="drawer-nav__group"
            >
              <button
                type="button"
                class="drawer-nav__row drawer-nav__acc"
                :aria-expanded="openIndex === i"
                @click="toggle(i)"
              >
                <span>{{ item.label }}</span>
                <v-icon
                  class="drawer-nav__chevron"
                  :class="{ 'drawer-nav__chevron--open': openIndex === i }"
                  size="22"
                >
                  {{ mdiChevronDown }}
                </v-icon>
              </button>
              <v-expand-transition>
                <div
                  v-show="openIndex === i"
                  class="drawer-nav__sub"
                >
                  <NuxtLink
                    v-for="(child, j) in item.children"
                    :key="j"
                    :to="child.link"
                    class="drawer-nav__sublink"
                    :class="{ 'drawer-nav__sublink--highlight': child.highlight }"
                    @click="handleNavigate"
                  >
                    <span>{{ child.label }}</span>
                    <v-icon
                      v-if="child.highlight"
                      class="drawer-nav__sublink-arrow"
                      size="18"
                    >
                      {{ mdiArrowRight }}
                    </v-icon>
                  </NuxtLink>
                </div>
              </v-expand-transition>
            </div>
            <!-- Lien simple -->
            <NuxtLink
              v-else
              :to="item.link"
              class="drawer-nav__row"
              @click="handleNavigate"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <a
          v-if="header?.button4?.visible"
          class="drawer-phone"
          href="tel:+33184807975"
          @click="handleButton4Click"
        >
          <v-icon size="20">
            {{ mdiPhoneOutline }}
          </v-icon>
          {{ header.button4.text }}
        </a>

        <v-btn
          v-if="header?.button5?.visible"
          block
          height="52"
          rounded="pill"
          color="primary"
          class="drawer-rdv text-subtitle-2"
          @click="handleButton5Click"
        >
          {{ header.button5.text }}
        </v-btn>
      </div>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup>
import { mdiArrowRight, mdiChevronDown, mdiPhoneOutline } from '@mdi/js'
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

const navigation = computed(() => header?.navigation ?? [])

// Which nav panel (Destinations, …) is expanded. Single-open accordion.
const openIndex = ref(null)
function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}

// Close the drawer after following a nav link.
function handleNavigate() {
  model.value = false
}
const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 200)
const isTransparent = false // computed(() => !isScrolled.value && route.path === '/')

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

/* ===== Navigation (rows + destinations panel) ===== */
.drawer-nav {
  display: flex;
  flex-direction: column;
}
.drawer-nav__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--drawer-border);
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  color: var(--drawer-ink);
  cursor: pointer;
}
.drawer-nav__chevron {
  color: var(--drawer-accent);
  transition: transform 0.2s ease;
}
.drawer-nav__chevron--open {
  transform: rotate(180deg);
}
.drawer-nav__sub {
  padding: 6px 0 10px 12px;
}
.drawer-nav__sublink {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--drawer-border);
  font-size: 15px;
  color: var(--drawer-muted);
}
.drawer-nav__sublink:last-child {
  border-bottom: none;
}
.drawer-nav__sublink--highlight {
  color: var(--drawer-accent);
  font-weight: 600;
}
.drawer-nav__sublink-arrow {
  color: var(--drawer-accent);
}

/* ===== Phone + RDV ===== */
.drawer-phone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--drawer-accent);
}
.drawer-rdv {
  margin-top: 16px;
  text-transform: none;
  letter-spacing: normal;
}

/* Theme tokens: swap ink/border/accent between solid and transparent states */
.drawer-content--solid {
  --drawer-ink: #222223;
  --drawer-muted: #444;
  --drawer-border: rgba(43, 76, 82, 0.13);
  --drawer-accent: rgb(43, 76, 82);
}
.drawer-content--transparent {
  --drawer-ink: #fff;
  --drawer-muted: rgba(255, 255, 255, 0.85);
  --drawer-border: rgba(255, 255, 255, 0.25);
  --drawer-accent: #fff;
}
</style>
