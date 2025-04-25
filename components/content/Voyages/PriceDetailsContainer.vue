<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="">
          <v-list-subheader class="text-subtitle-1 grey-darken-3 pb-0 py-md-4">
            <v-chip
              variant="flat"
              color="green"
            >
              <slot name="left-column-phrase" />
            </v-chip>
          </v-list-subheader>
          <v-container>
            <slot name="items-list-include" />
          </v-container>
        </v-list>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="pl-md-4">
          <v-list-subheader class="text-subtitle-1 grey-darken-3 pb-0 py-md-4">
            <v-chip
              variant="flat"
              color="secondary"
            >
              <slot name="right-column-phrase" />
            </v-chip>
          </v-list-subheader>
          <v-container>
            <slot name="items-list-exclude" />
          </v-container>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>
