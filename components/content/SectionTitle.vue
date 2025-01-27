<template>
  <!-- <div class="mt-16 ml-9 ">
    <h2
      class="font-weight-black text-h5 text-md-h4 my-6"
    >
      <slot
        mdc-unwrap="p"
      />
    </h2>
  </div> -->
  <v-container>
    <v-row
      class="mt-8"
    >
      <v-col
        cols="12"
      >
        <h2 class="font-weight-black text-h5 text-md-h4 my-6">
          <slot mdc-unwrap="p" />
        </h2>
      </v-col>
    </v-row>
  </v-container>
</template>
