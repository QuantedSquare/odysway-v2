<template>
  <div class="d-flex flex-column align-center">
    <v-row class="py-0">
      <v-col>
        <h2 class="text-center">
          {{ page.first_step.title }}
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-radio-group
          id="devis-skipper-radio-group"
          v-model="model"
          :mandatory="true"
        >
          <v-radio
            id="devis-radio-devis"
            :label="page.first_step.option_1"
            value="devis"
          />
          <v-radio
            id="devis-radio-tally"
            :label="page.first_step.option_2"
            value="tally"
          />
          <v-radio
            id="devis-radio-call"
            :label="page.first_step.option_3"
            value="call"
          />
        </v-radio-group>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const { page } = defineProps({
  page: {
    type: Object,
    required: true,
  },
})

const model = defineModel()

// Ensure the model is properly initialized
onMounted(() => {
  if (!model.value) {
    model.value = 'devis' // Set default value
  }
})
</script>
