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
        <v-lazy
          :min-height="50"
          :options="{ threshold: 0.5 }"
          transition="fade-transition"
        >
          <v-img
            :src="img(partenaire?.imgSrc, { format: 'webp', quality: 70, height: 32, width: 320 })"
            :lazy-src="img(partenaire?.imgSrc, { format: 'webp', quality: 10, height: 32, width: 320 })"
            :srcset="`${img(partenaire?.imgSrc, { format: 'webp', quality: 70, width: 320 })} 320w, ${img(partenaire?.imgSrc, { format: 'webp', quality: 70, width: 640 })} 640w`"
            :alt="`logo du partenaire ${partenaire.description}`"
            height="50"
            width="150"
          />
        </v-lazy>
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
