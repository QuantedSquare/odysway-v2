<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <div
          class="pr-md-10"
        >
          <slot name="left-side" />
        </div>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-none d-md-block align-self-start position-sticky sticky-right"
        :style="{ top: stickyTop }"
      >
        <slot name="right-side" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useWindowScroll } from '@vueuse/core'

const { y, directions } = useWindowScroll()

const headerVisible = ref(true)

watch([() => directions.top, () => directions.bottom, y], () => {
  if (y.value <= 20) {
    headerVisible.value = true
  }
  else if (directions.top) {
    headerVisible.value = true
  }
  else if (directions.bottom) {
    headerVisible.value = false
  }
})

const stickyTop = computed(() => headerVisible.value ? '90px' : '20px')
</script>

<style scoped>
.sticky-right {
  transition: top 0.3s ease-in-out;
}
</style>
