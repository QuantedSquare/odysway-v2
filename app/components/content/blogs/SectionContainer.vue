<template>
  <div class="container-wrapper">
    <div class="row-wrapper">
      <div class="col-wrapper content-class px-0 px-md-3 text-left">
        <slot name="content" />
      </div>
    </div>
  </div>
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
/* Container: replicates v-container behavior */
.container-wrapper {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1264px; /* Vuetify default max-width */
}

@media (min-width: 600px) {
  .container-wrapper {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* Row: replicates v-row with justify="center" behavior */
.row-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin: -12px;
  justify-content: center;
}

/* Column: replicates v-col cols="12" lg="8" behavior */
.col-wrapper {
  flex: 0 0 auto;
  width: 100%; /* cols="12" = 12/12 = 100% */
  padding: 12px;

}

@media (min-width: 1280px) {
  .col-wrapper {
    width: 66.666667%; /* lg="8" = 8/12 = 66.67% */
  }
}

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
  .content-class:deep(h3), .content-class:deep(h2){
    display: flex!important;
    justify-content: center!important;
    text-align: center!important;
  }
</style>
