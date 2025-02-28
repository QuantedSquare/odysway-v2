<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
    :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
    height="100vh"
    cover
    class="position-relative"
  >
    <v-btn-primary
      to="/"
      color="white"
      class="btn-position hidden-sm-and-down pl-md-0"
    >
      <template #prepend>
        <v-icon>
          {{ mdiChevronLeft }}
        </v-icon>
      </template>

      <span> retour aux voyages</span>
    </v-btn-primary>
    <v-btn
      to="/"
      variant="outlined"
      density="compact"
      color="white"
      :icon="mdiChevronLeft"
      class="btn-position hidden-md-and-up"
    />
    <div class="h-100 d-flex align-center">
      <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
            md="auto"
          >
            <h1 class="text-h3 text-md-h1">
              <slot
                name="title"
                mdc-unwrap="p"
              />
            </h1>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          align="start"
          align-md="center"
        >
          <v-col
            cols="10"
            sm="5"
            md="4"
          >
            <slot
              name="component-slot-1"
            />
          </v-col>
          <v-col
            cols="10"
            sm="5"
            md="4"
          >
            <slot
              name="component-slot-2"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-img>
</template>

<script setup>
import { mdiChevronLeft } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})
const img = useImage()
</script>

<style scoped>
.btn-position{
  position: absolute;
  top: 10%;
  left: 32px;
}
.v-btn__prepend {
  margin: 0px !important;
}
.img-shadow{
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
.title-container {
  container-type: inline-size;
}
.title-container .responsive-title {
  font-size: 19.2cqw;
  text-align: start;
}
.responsive-subtitle {
  font-size: 10.9cqw;
  text-align: start;
}
</style>
