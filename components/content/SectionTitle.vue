<template>
  <v-container>
    <v-row
      justify="center"
      no-gutters
    >
      <v-col
        cols="10"
        md="11"
        class="text-textColor"
      >
        <h2 class="font-weight-black text-h5 text-md-h4 my-6">
          <slot mdc-unwrap="p" />
        </h2>
      </v-col>
    </v-row>
  </v-container>
</template>
