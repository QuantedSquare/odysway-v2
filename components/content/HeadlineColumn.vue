<template>
  <v-col
    cols="10"
    md="4"
  >
    <h2 class="my-6 pb-6 text-h5 font-weight-black text-textColor">
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </h2>
    <p class="text-body-1 text-textColor">
      <slot
        name="text"
        mdc-unwrap="p"
      />
    </p>
  </v-col>
</template>
