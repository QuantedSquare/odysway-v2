<template>
  <v-col
    cols="12"
    md="4"
    class="text-textColor"
  >
    <h2 class="my-6 pb-6 text-h5 font-weight-black">
      <slot
        name="title"
      />
    </h2>
    <slot
      name="text"
    />
  </v-col>
</template>
