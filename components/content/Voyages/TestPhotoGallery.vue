<template>
  <div class="text-center pa-4">
    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      fullscreen
    >
      <template #activator="{ props: activatorProps }">
        <v-btn
          text="voir la galerie photos"
          v-bind="activatorProps"
          variant="outlined"
          size="large"
          :append-icon="mdiPlay"
          color="text-shadow bg-blur onHover"
        />
      </template>
      <v-sheet>
        <v-btn
          variant="outlined"
          :prepend-icon="mdiClose"
          color="grey-darken-3"
          class="ma-4"
          @click="dialog = false"
        >
          Fermer
        </v-btn>

        <h1 class="text-center text-h3 font-weight-black">
          Immersion hivernale en terre béarnaise
        </h1>
        <v-container fluid>
          <v-row justify="end">
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
                  :src="props.images[0]"
                  height="100%"
                  cover
                />
                <v-card-text> Immersion hivernale en terre béarnaise</v-card-text>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="mb-4 my-md-10"
            >
              <v-img
                :src="props.images[1]"
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
                :src="props.images[2]"
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
                :src="props.images[3]"
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
                :src="props.images[4]"
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
                :src="props.images[5]"
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

const props = defineProps({
  images: {
    type: Array,
  },
})
const dialog = ref(false)
</script>

<style scoped>
.bg-blur{
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3)
}
.onHover:hover{
  scale: 1.03;
}
</style>
