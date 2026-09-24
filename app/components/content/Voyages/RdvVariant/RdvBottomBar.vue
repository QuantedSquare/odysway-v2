<template>
  <v-app-bar
    location="bottom"
    class="d-md-none bottom-app-bar mx-0"
  >
    <v-container class="px-3 d-flex align-center ga-3">
      <div class="d-flex flex-column flex-shrink-0">
        <span
          v-if="startingPrice > 0"
          class="text-h5 font-weight-bold text-primary"
        >
          {{ startingPrice }}€
        </span>
        <button
          type="button"
          class="dates-link"
          @click="emit('scroll-to-dates', 'sticky')"
        >
          {{ datesText }}
        </button>
      </div>
      <v-btn-secondary
        height="46"
        rounded="md"
        class="flex-grow-1 text-body-2 font-weight-bold text-decoration-none"
        @click="openRdv('sticky')"
      >
        {{ rdvButtonText }}
      </v-btn-secondary>
    </v-container>
  </v-app-bar>
</template>

<script setup>
defineProps({
  startingPrice: {
    type: Number,
    default: 0,
  },
  datesText: {
    type: String,
    required: true,
  },
  rdvButtonText: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['scroll-to-dates'])
const { openRdv } = useRdvBooking()
</script>

<style scoped>
.bottom-app-bar {
  z-index: 1020 !important;
  width: 100% !important;
}
.dates-link {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  background: none;
  border: 0;
  padding: 0;
  text-align: left;
  cursor: pointer;
}
</style>
