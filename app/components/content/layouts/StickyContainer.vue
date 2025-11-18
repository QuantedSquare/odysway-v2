<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row>
      <v-col
        cols="12"
        :md="leftSpace"
        :class="leftSticky ? 'd-none d-md-block' : '' "
      >
        <div
          class="pr-md-10"
          :class="leftSticky ? 'position-sticky sticky-top': '' "
        >
          <slot name="left-side" />
        </div>
      </v-col>
      <v-col
        cols="12"
        :md="rightSpace"
        :class="rightSticky ? 'd-none d-md-block ' : '' "
      >
        <div
          :class="rightSticky ? 'position-sticky sticky-top-right': '' "
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
.sticky-top {
  top: 90px;
}
.sticky-top-right {
  top: 90px;
}

@media (max-width: 960px) {
  .sticky-top {
    top: 60px;
  }
  .sticky-top-right {
    top: 60px;
  }
}
</style>
