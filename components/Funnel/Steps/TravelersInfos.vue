<template>
  <div>
    test
  </div>
</template>

<script setup>
const submitStepData = async () => {
  // Validate form
  // if (!validateForm()) return false
  return await 'caca'
  // try {
  //   // Submit form data
  //   await $fetch('/api/submit-details', {
  //     method: 'POST',
  //     body: formData.value
  //   })
  //   return true
  // } catch (error) {
  //   // Handle errors
  //   return false
  // }
}

defineExpose({
  submitStepData,
  key: 'travelersInfos',
})
</script>
