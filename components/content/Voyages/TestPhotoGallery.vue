<template>
  <div>
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      fullscreen
    >
      <template #activator="{ props: activatorProps }">
        <v-btn
          text="voir la galerie photos"
          v-bind="activatorProps"
          variant="outlined"
          size="large"
          :append-icon="mdiPlay"
          color="text-shadow bg-blur on-hover"
        >
          <span class="text-caption text-uppercase text-md-button">voir la galerie photos</span>
        </v-btn>
      </template>
      <v-sheet>
        <v-container fluid>
          <v-row>
            <v-spacer />
            <v-col cols="auto">
              <v-btn
                variant="outlined"
                :prepend-icon="mdiClose"
                color="grey-darken-3"
                class="ma-4 on-hover"
                @click="dialog = false"
              >
                Fermer
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col>
              <h1 class="text-center text-md-start text-h3 font-weight-black">
                <slot
                  name="title"
                  mdc-unwrap="p"
                />
              </h1>
            </v-col>
            <v-col
              cols="12"
              md="9"
              class="mb-4 mb-md-8"
            >
              <v-card
                variant="text"
                rounded="0"
              >
                <v-img
                  :src="img(props.images[0], { format: 'wepb', quality: 80 })"
                  :lazy-src="img(props.images[0], { format: 'webp', quality: 10, height: 900 })"
                  height="100%"
                  cover
                />
              </v-card>
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="mb-4 my-md-10"
            >
              <v-img
                :src="img(props.images[1], { format: 'wepb', quality: 80 })"
                :lazy-src="img(props.images[1], { format: 'webp', quality: 10, height: 900 })"
                height="100%"
                class="mr-md-8"
                cover
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="my-4 my-md-10"
            >
              <v-img
                :src="img(props.images[2], { format: 'wepb', quality: 80 })"
                :lazy-src="img(props.images[2], { format: 'webp', quality: 10, height: 900 })"
                height="100%"
                cover
                class="ml-md-8"
              />
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col
              cols="12"
              md="9"
              class="my-4 my-md-8"
            >
              <v-img
                :src="img(props.images[3], { format: 'wepb', quality: 80 })"
                :lazy-src="img(props.images[3], { format: 'webp', quality: 10, height: 900 })"
                height="100%"
                cover
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="my-4 my-md-8"
            >
              <v-img
                :src="img(props.images[4], { format: 'wepb', quality: 80 })"
                :lazy-src="img(props.images[4], { format: 'webp', quality: 10, height: 900 })"
                height="100%"
                cover
                class="mr-md-8"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="my-4 my-md-8"
            >
              <v-img
                :src="img(props.images[5], { format: 'wepb', quality: 80 })"
                :lazy-src="img(props.images[5], { format: 'webp', quality: 10, height: 900 })"
                height="100%"
                cover
                class="ml-md-8"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script setup>
import { mdiClose, mdiPlay } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  images: {
    type: Array,
  },
})

const img = useImage()

const dialog = ref(false)
</script>

<style scoped>
.bg-blur{
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}
</style>
