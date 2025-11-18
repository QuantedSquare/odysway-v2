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
        class="d-none d-md-block align-self-start"
      >
        <div
          class="position-sticky sticky-top-right"
        >
          <slot name="right-side" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

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
