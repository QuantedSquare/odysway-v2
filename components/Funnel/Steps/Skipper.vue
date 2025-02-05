<template>
  <v-card class="d-flex flex-column align-center">
    <v-row class="py-0">
      <v-col>
        <h2 class="my-0">
          {{ page.fields.first_step.title }}
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
            :label="page.fields.first_step.option_3"
            value="quick"
          />
          <v-radio
            :label="isBooking ? 'Poser une option sur ce voyage' : page.fields.first_step.option_1"
            value="normal"
          />
        </v-radio-group>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
const route = useRoute()
const { page } = defineProps(['page'])
const model = defineModel()

const isBooking = route.query.free_booking === 'true'
</script>
