<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        :md="leftSpace"
        :class="leftSticky ? 'd-none d-md-block' : '' "
      >
        <div
          class="sticky-top"
          :class="leftSticky ? 'position-sticky ': '' "
        >
          <slot name="left-side" />
        </div>
      </v-col>
      <v-col
        cols="12"
        :md="rightSpace"
        :class="rightSticky ? 'd-none d-md-block' : '' "
      >
        <div
          class="sticky-top"
          :class="rightSticky ? 'position-sticky': '' "
        >
          <slot name="right-side" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  leftSpace: {
    type: Number,
    default: 8,
    validator() {
      return [3, 4, 5, 6, 7, 8, 9]
    },
  },
  rightSpace: {
    type: Number,
    default: 4,
    validator() {
      return [3, 4, 5, 6, 7, 8, 9]
    },
  },
  leftSticky: {
    type: Boolean,
    default: false,
  },
  rightSticky: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.sticky-top{
  top: 64px;
}
</style>
