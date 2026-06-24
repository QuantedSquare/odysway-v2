<template>
  <section
    v-if="displayItems.length"
    class="trust"
    aria-label="Garanties et réassurance"
  >
    <div class="trust__inner">
      <div
        v-for="(item, i) in displayItems"
        :key="i"
        class="trust__item"
      >
        <v-icon
          :icon="iconFor(item.icon)"
          class="trust__icon"
          size="20"
        />
        <span class="trust__text">
          <span v-if="item.textBefore">{{ item.textBefore }}</span>
          <b v-if="item.boldText">{{ item.boldText }}</b>
          <span v-if="item.text">{{ item.text }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  mdiStar,
  mdiMessageOutline,
  mdiShieldCheckOutline,
  mdiCheckCircleOutline,
  mdiCalendarHeart,
  mdiHeartOutline,
} from '@mdi/js'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

// Fallback copy used when the CMS field is empty. textBefore / boldText / text
// let the bold part sit before OR after the regular text (demo).
const defaultItems = [
  { icon: 'star', boldText: '4,9/5', text: 'sur Trustpilot' },
  { icon: 'message', boldText: '172', text: 'avis vérifiés' },
  { icon: 'shield', textBefore: 'Garantie', boldText: 'APST' },
  { icon: 'check', textBefore: 'Immatriculée', boldText: 'Atout France' },
  { icon: 'calendar', textBefore: 'Agence', boldText: 'depuis 2018' },
]

const displayItems = computed(() => (props.items?.length ? props.items : defaultItems))

const icons = {
  star: mdiStar,
  message: mdiMessageOutline,
  shield: mdiShieldCheckOutline,
  check: mdiCheckCircleOutline,
  calendar: mdiCalendarHeart,
  heart: mdiHeartOutline,
}

const iconFor = key => icons[key] || mdiCheckCircleOutline
</script>

<style scoped>
.trust {
  background: #fff;
  border-bottom: 1px solid rgba(43, 76, 82, 0.13);
}

.trust__inner {
  max-width: 1180px;
  margin-inline: auto;
  padding: 16px 24px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  /* flex-start (not center) + auto margins on the edge items: the group is
     centred when it fits, but collapses to the left and stays fully
     scrollable when it overflows (justify-content:center would hide the
     leading items past the left edge). */
  justify-content: flex-start;
  overflow-x: auto;
  scrollbar-width: none;
}

.trust__inner::-webkit-scrollbar {
  display: none;
}

.trust__item {
  flex: 0 0 auto;
  white-space: nowrap;
}

.trust__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 26px;
  font-size: 14px;
  border-left: 1px solid rgba(43, 76, 82, 0.13);
  color: #5d6566;
}

.trust__item:first-child {
  border-left: none;
  margin-left: auto;
}

.trust__item:last-child {
  margin-right: auto;
}

.trust__icon {
  color: rgb(var(--v-theme-primary));
}

.trust__text {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.trust__item b {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

@media (max-width: 768px) {
  .trust__inner {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    gap: 0;
    padding: 9px 18px;
    scrollbar-width: none;
  }

  .trust__inner::-webkit-scrollbar {
    display: none;
  }

  .trust__item {
    padding: 3px 14px;
    font-size: 12.5px;
    white-space: nowrap;
  }
}
</style>
