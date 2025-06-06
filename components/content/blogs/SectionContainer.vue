<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        lg="8"
        class="content-class px-0 px-md-3"
      >
        <slot name="content" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.content-class:deep(a){
  color: rgb(var(--v-theme-primary))!important;
}
.content-class:deep(p){
  margin: 1.5rem 0;
}
.content-class:deep(h2){
 margin-bottom: 1em;
}
.content-class:deep(h3){
 margin-bottom: 1em;
}
</style>
