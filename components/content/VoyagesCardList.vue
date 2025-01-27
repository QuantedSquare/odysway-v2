<template>
  <v-container fluid>
    <v-row
      dense
      justify="center"
      align="center"
    >
      <v-col cols="auto">
        <v-icon
          icon="mdi-chevron-left"
          size="large"
        />
      </v-col>
      <v-col class="d-flex overflow-auto hidden-scroll">
        <slot />
      </v-col>

      <v-col cols="auto">
        <v-icon
          icon="mdi-chevron-right"
          size="large"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
