<!-- <template>
  <li :style="{ listStyle: `url(${props.listMarker})` }">
    <slot
      name="item"
      mdc-unwrap="p"
    />
  </li>
</template>

<script setup>
const props = defineProps({
  listMarker: {
    type: String,
    default: '',
  },
})
</script> -->

<template>
  <v-list-item class="text-subtitle-1 text-grey-darken-3 pl-0">
    <slot
      name="item"
    />
  </v-list-item>
</template>
