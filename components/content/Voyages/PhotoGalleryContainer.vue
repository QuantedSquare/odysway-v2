<!-- <template>
  <v-container>
    <v-row>
      <v-col
        cols="6"
      >
        <v-img
          :src="props.images[0]"
          height="100%"
          cover
        />
      </v-col>
      <v-col
        cols="6"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="props.images[1]"
              height="100%"
              cover
            />
          </v-col>
          <v-col
            cols="6"
          >
            <v-img
              :src="props.images[2]"
              height="100%"
              cover
            />
          </v-col>
          <v-col cols="6">
            <v-img
              :src="props.images[3]"
              height="100%"
              cover
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="6"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="props.images[0]"
              height="100%"
              cover
            />
          </v-col>
          <v-col
            cols="6"
          >
            <v-img
              :src="props.images[1]"
              height="100%"
              cover
            />
          </v-col>
          <v-col
            cols="6"
          >
            <v-img
              :src="props.images[2]"
              height="100%"
              cover
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="6"
      >
        <v-img
          :src="props.images[3]"
          height="100%"
          cover
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  images: {
    type: Array,
  },
})
</script> -->

<template>
  <v-col cols="auto">
    <v-card
      variant="flat"
      width="150"
      height="150"
      rounded="lg"
    >
      <template #image>
        <v-img :src="img(categorie?.image, { format: 'webp', quality: 70, width: 200, height: 200 })" />
      </template>
      <span class="shadow text-white font-weight-bold position-absolute bottom-0 pa-2">
        {{ categorie.title }}
      </span>
    </v-card>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
</script>

<style scoped>
 .shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3)
  }
</style>
