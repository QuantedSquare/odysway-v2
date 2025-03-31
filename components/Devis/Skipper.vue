<template>
  <v-card class="d-flex flex-column align-center">
    <v-row class="py-0">
      <v-col>
        <h2 class="my-0">
          {{ page.title }}
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-radio-group
          v-model="model"
          :mandatory="true"
        >
          <v-radio
            :label="page.option_1"
            value="devis"
          />
          <v-radio
            :label="page.option_2"
            value="tally"
          />
          <v-radio
            :label="page.option_3"
            value="call"
          />
        </v-radio-group>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
defineProps({
  page: {
    type: Object,
    required: true,
  },
})
const model = defineModel()
</script>
