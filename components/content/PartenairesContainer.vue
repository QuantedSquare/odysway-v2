<template>
  <v-container
    class="bg-sectionBg mt-6 pt-9 pb-9"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        v-for="(logo, index) in partenaires"
        :key="index"
        cols="6"
        md="2"
        class="pt-4 pb-4 pl-10 pr-10"
      >
        <v-img
          :src="img(logo.imgSrc, { format: 'webp', quality: 70, height: 110 })"
          :alt="`Logo du partenaire ${logo.description}`"
          contain
          height="110px"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  partenaireLogo: {
    type: String,
    required: true,
  },
})

const img = useImage()

const { data: partenaires } = await useAsyncData('partenaires', () => {
  return queryCollection('partenaires').all()
})
</script>
