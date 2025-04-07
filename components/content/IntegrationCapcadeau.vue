<template>
  <div
    class="cap-cadeau-widget"
    data-url="https://www.capcadeau.com/widget/liste-bons/1144"
  />
</template>

<script setup>
onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://www.capcadeau.com/js/capcadeau.js'
  script.async = true
  const widget = document.querySelector('.cap-cadeau-widget')
  widget.appendChild(script)
})
</script>

<style scoped>

</style>
