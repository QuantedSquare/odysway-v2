<template>
  <v-col
    cols="11"
    sm="10"
    md="3"
    class="text-textColor"
  >
    <h2 class="my-6 pb-6 text-h5 font-weight-black">
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </h2>
    <p class="text-body-1">
      <slot
        name="text"
        mdc-unwrap="p"
      />
    </p>
  </v-col>
</template>
