<template>
  <v-container>
    <v-row
      dense
      align="center"
      no-gutters
      class="flex-nowrap"
    >
      <v-col cols="auto">
        <v-icon
          icon="mdi-chevron-left"
          size="x-large"
          @click="scrollVoyages(-400)"
        />
      </v-col>
      <v-col cols="10">
        <v-row
          ref="voyageList"
          class="flex-nowrap overflow-auto hidden-scroll"
        >
          <slot mdc-unwrap="p" />
        </v-row>
      </v-col>
      <v-col cols="auto">
        <v-icon
          icon="mdi-chevron-right"
          size="x-large"
          @click="scrollVoyages(400)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const voyageList = ref(null)

function scrollVoyages(scrollAmount) {
  voyageList.value.$el.scroll({
    left: voyageList.value.$el.scrollLeft + scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
