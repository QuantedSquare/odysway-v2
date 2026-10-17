<template>
  <div class="rdv-band my-8">
    <p class="mb-0">
      {{ text }}
    </p>
    <v-btn-secondary
      height="48"
      rounded="md"
      class="text-body-2 font-weight-bold text-decoration-none flex-shrink-0"
      @click="openRdv(position)"
    >
      {{ buttonText }}
    </v-btn-secondary>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'band',
  },
})

const { openRdv } = useRdvBooking()
</script>

<style scoped>
.rdv-band {
  background: rgb(var(--v-theme-primary));
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #fff;
  font-size: 1rem;
  line-height: 1.55;
}
@media (min-width: 960px) {
  .rdv-band {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 24px;
  }
}
</style>
