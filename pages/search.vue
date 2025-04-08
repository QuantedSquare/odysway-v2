<template>
  <div>
    <h1>Search</h1>
  </div>
</template>

<script setup>
// const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('voyages'))
const { data: files } = await useAsyncData('search', () => queryCollectionSearchSections('voyages'))
// console.log(navigation.value)
console.log(files.value)
</script>
