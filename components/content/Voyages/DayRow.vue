<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-img
          rounded="lg"
          :src="img(props.image, { format: 'webp', quality: 70, width: 1024 })"
          cover
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-card variant="text">
          <v-card-subtitle class="text-primary font-weight-black">
            <slot name="subtitle" />
          </v-card-subtitle>
          <v-card-title class="text-uppercase no-white-space">
            <slot name="title" />
          </v-card-title>
          <v-card-text class="text-body-1 text-grey-darken-3">
            <slot
              name="text"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
    default: '',
  },
})

const img = useImage()
</script>
