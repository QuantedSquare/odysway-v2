<template>
  <div>
    <ConfirmationContainer v-if="page && status === 'success'">
      <template #title_option>
        <h1>{{ page.titleOption }}</h1>
      </template>
      <template #title_default>
        <h1>{{ page.titleDefault }}</h1>
      </template>
      <template #error>
        <h1>{{ page.titleError }}</h1>
        <p>{{ page.errorMessage }}</p>
      </template>
      <template #accroche_option>
        <p>{{ page.accrocheOption }}</p>
      </template>
      <template #accroche_default>
        <p>{{ page.accrocheDefault }}</p>
      </template>
      <template #accroche_devis>
        <p>{{ page.accrocheDevis }}</p>
      </template>
    </ConfirmationContainer>
    <div
      v-else-if="status === 'pending'"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup>
const sanity = useSanity()

const confirmationQuery = groq`*[_type == "confirmation" && slug.current == "confirmation"][0]{
  titleOption,
  titleDefault,
  titleError,
  errorMessage,
  accrocheOption,
  accrocheDefault,
  accrocheDevis
}`

const { data: page, status } = await useAsyncData('confirmation-page', () =>
  sanity.fetch(confirmationQuery)
)
</script>
