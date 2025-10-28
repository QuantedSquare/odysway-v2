<template>
  <v-container
    class="d-flex justify-center"
    fluid
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        v-for="(partenaire, key) in partenaires.partenairesSection.images"
        :key="key"
        cols="6"
        class="d-flex justify-center align-center"
        :md="partenaires.length > 4 ? 2 : 3"
      >
        <v-lazy
          :min-height="50"
          :options="{ threshold: 0.5 }"
          transition="fade-transition"
        >
          <v-img
            :src="img(getImageUrl(partenaire.asset._ref, { format: 'webp', quality: 70, height: 32, width: 320 }))"
            :lazy-src="img(getImageUrl(partenaire.asset._ref, { format: 'webp', quality: 10, height: 32, width: 320 }))"
            alt="logo du partenaire"
            class="partenaire-img-sizing white-filter"
          />
        </v-lazy>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { getImageUrl } from '~/utils/getImageUrl'

const img = useImage()

const { data: partenaires } = await useAsyncData(
  'partenairesImg',
  async () => {
    try {
      const sanity = useSanity()
      const result = await sanity.fetch(groq`*[_type == "ctas"][0]{
        partenairesSection{
          images
        }
      }`)
      return result || null
    }
    catch (e) {
      console.error('Error fetching partenaires images:', e)
      return null
    }
  },
  {
    server: true,
  },
)
</script>

<style scoped>
.white-filter {
  filter: brightness(0) invert(1);
}
.partenaire-img-sizing {
  height: 100px;
  width: 150px;
}
@media (max-width: 600px) {
  .partenaire-img-sizing {
    height: 50px;
    width: 100px;
  }
}
</style>
