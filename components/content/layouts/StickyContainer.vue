<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        :md="Number(leftSpace)"
      >
        <div :class="leftSticky === 'true' ? 'element-position': '' ">
          <slot name="left-side" />
        </div>
      </v-col>
      <v-col
        class="d-none d-md-block"
        :md="Number(rightSpace)"
      >
        <div
          class="mt-12"
          :class="rightSticky === 'true' ? 'element-position': '' "
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
    type: String,
    default: '8',
  },
  rightSpace: {
    type: String,
    default: '4',
  },
  leftSticky: {
    type: String,
    default: 'false',
  },
  rightSticky: {
    type: String,
    default: 'false',
  },
})
</script>

<style scoped>
.element-position{
  position:sticky;
  top: 64px;
}
</style>
