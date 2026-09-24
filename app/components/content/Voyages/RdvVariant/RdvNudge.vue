<template>
  <div class="rdv-nudge my-8">
    <div>
      <strong class="text-body-1 font-weight-bold text-primary">{{ title }}</strong>
      <div class="text-body-2 text-primary-light-2">
        {{ subtitle }}
      </div>
    </div>
    <v-btn-secondary
      height="48"
      rounded="md"
      class="text-body-2 font-weight-bold text-decoration-none flex-shrink-0"
      @click="openRdv('faq')"
    >
      {{ buttonText }}
    </v-btn-secondary>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    required: true,
  },
})

const { openRdv } = useRdvBooking()
</script>

<style scoped>
.rdv-nudge {
  border: 1px dashed #CBD7D9;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 960px) {
  .rdv-nudge {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
}
</style>
