<template>
  <v-container
    fluid
    class="bg-sectionBg mt-8"
  >
    <v-row
      align="center"
      justify-md="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="4"
            class="d-none d-lg-flex"
          >
            <v-img
              rounded="lg"
              :src="image"
            />
          </v-col>
          <v-col class="text-textColor">
            <h2 class="my-6 text-h5 text-h4 font-weight-black">
              <slot name="title" />
            </h2>
            <slot name="text" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
    required: true,
    default: '/images/IMG-20240320-WA0124.jpg',
  },
})
</script>
