<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="">
          <v-list-subheader class="text-subtitle-1 grey-darken-3 pb-0 py-md-4">
            <slot name="left-column-phrase" />
          </v-list-subheader>
          <v-container>
            <slot name="items-list-include" />
          </v-container>
        </v-list>
      </v-col>
      <v-divider :vertical="$vuetify.display.mdAndUp" />
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="pl-md-4">
          <v-list-subheader class="text-subtitle-1 grey-darken-3 pb-0 py-md-4">
            <slot name="right-column-phrase" />
          </v-list-subheader>
          <v-container>
            <slot name="items-list-exclude" />
          </v-container>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-list--density-default .v-list-subheader {
  padding-inline-start: 0 !important;
}
</style>
