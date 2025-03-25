<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
        class="content-class"
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
 text-align: center;
 margin-bottom: 1em;
 color:black!important;
}
.content-class:deep(h3){
 text-align: center;
 margin-bottom: 1em;
}
</style>
