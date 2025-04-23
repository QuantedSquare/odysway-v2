<template>
  <v-container
    class="d-flex justify-center"
    fluid
  >
    <v-row>
      <v-col
        v-for="(partenaire, key) in partenaires"
        :key="key"
        cols="6"
        :md="partenaires.length > 4 ? 2 : 3"
      >
        <v-img

          :src="img(partenaire?.imgSrc, { format: 'webp', quality: 70, height: 32, width: 320 })"
          :alt="`logo du partenaire ${partenaire.description}`"
          height="50"
          width="150"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const img = useImage()

const { data: partenaires } = await useAsyncData('partenaires', () => {
  return queryCollection('partenaires').all()
})
</script>
