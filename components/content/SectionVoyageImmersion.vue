<template>
  <v-container
    fluid
    class="bg-sectionBg mt-8"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="11"
        sm="10"
        md="8"
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            :class="$vuetify.display.mdAndDown ? 'd-none' : ''"
            cols="4"
          >
            <v-img
              rounded="lg"
              :src="image"
            />
          </v-col>
          <v-col offset-lg="1">
            <h2 class="my-6 text-h4 font-weight-black">
              <slot
                name="title"
                mdc-unwrap="p"
              />
            </h2>
            <p>
              <slot
                name="text"
                mdc-unwrap="p"
              />
            </p>
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
    default: '',
  },
})
</script>
