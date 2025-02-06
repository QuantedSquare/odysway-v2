<template>
  <div v-if="status === 'pending'">
    ...
  </div>
  <div v-else-if="status === 'success'">
    {{ deal }}
  </div>
</template>

<script setup>
const { dealId } = useRoute().params
const status = ref('success')
const deal = await $fetch('/api/v1/ac/deals/' + dealId)
console.log(deal)
// const { status, data: deal } = useFetch('/api/v1/ac/deals/' + dealId)
</script>
