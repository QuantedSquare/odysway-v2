<template>
  <v-container
    v-if="deal"

    id="dates-container"
  >
    <v-row>
      <v-col
        v-for="(date, index) in deal.dates"
        :key="index"
        cols="12"
      >
        <DatesPricesItem :date="Object.assign(date, { index })" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { data: deal } = await useAsyncData(props.slug, async () => {
  const query = await queryCollection('deals').where('slug', '=', props.slug).first()
  return query
})
</script>

<style scoped>

</style>
