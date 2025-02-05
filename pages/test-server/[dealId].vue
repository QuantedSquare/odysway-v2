<template>
  <div v-if="status === 'pending'">
    ...
  </div>
  <div v-else-if="status === 'success'">
    coucou
  </div>
</template>

<script setup>
const { dealId } = useRoute().params
// const test = await $fetch('/api/v1/ac/deals/' + dealId)
const { status, data: deal } = useFetch('/api/v1/ac/contacts/' + dealId + '/deals')

console.log(deal)
</script>
