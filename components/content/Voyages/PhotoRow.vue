<template>
  <v-row>
    <v-col
      cols="12"
      :md="cols"
      class="my-md-8"
    >
      <v-img
        :src="img(props.photoSrc[0], { format: 'webp', quality: 100 })"
        height="100%"
        cover
        class="mr-md-8"
      />
    </v-col>
    <v-col
      v-show="cols <= 6"
      cols="12"
      :md="cols"
      class="my-md-8"
    >
      <v-img
        :src="img(props.photoSrc[1], { format: 'webp', quality: 100 })"
        height="100%"
        cover
        class="ml-md-8"
      />
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  photoSrc: {
    type: Array,
  },
  colWidth: {
    type: String,
    default: '12',
  },
})

const img = useImage()

const cols = computed(() => {
  return Number(props.colWidth)
})
</script>
