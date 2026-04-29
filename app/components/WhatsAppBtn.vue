<template>
  <div class="whatsapp-wrapper">
    <span
      class="whatsapp-hint"
      :class="{ visible: showHint }"
    >
      Poser une question sur le voyage ?
    </span>
    <v-tooltip
      text="Poser une question à Odysway ? ( vous serez redirigé vers WhatsApp )"
      aria-label="Poser une question à Odysway via WhatsApp"
      location="top"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          href="https://wa.me/+33780919540"
          icon
          aria-label="Contacter Odysway sur WhatsApp"
          rounded="circle"
          height="70"
          width="70"
          color="white"
          @click="handleWhatsappClick"
        >
          <img
            src="/icons/whatsapp_logo_icon_186881.svg"
            alt="whatsapp"
            width="70"
            height="70"
          >
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup>
const { trackWhatsappClick } = useGtmTracking()
const route = useRoute()
const showHint = ref(false)

watch(() => route.path, () => {
  if (route.path.includes('/voyages')) showHint.value = true
  setTimeout(() => {
    showHint.value = false
  }, 5000)
}, { immediate: true })

const handleWhatsappClick = () => {
  trackWhatsappClick()
}
</script>

<style scoped>
.whatsapp-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.whatsapp-hint {
  position: absolute;
  right: calc(100% + 10px);
  white-space: nowrap;
  background: white;
  color: #333;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.whatsapp-hint.visible {
  opacity: 1;
}
</style>
