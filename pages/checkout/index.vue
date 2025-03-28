<template>
  <v-container
    fluid
    class="mt-10 relative"
  >
    <v-img
      v-if="deal && dealStatus === 'success'"
      :src="img(deal.imgSrc2.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(deal.imgSrc2.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(deal.imgSrc2.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(deal.imgSrc2.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      :alt="deal.imgSrc2.alt"
      height="350px"
      cover
      class="absolute"
    />
    <v-row
      justify="center"
    >
      <FunnelCheckoutStepper />
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const route = useRoute()
const loading = ref(true)
const error = ref(null)

// Get encrypted params from URL
const encryptedParams = route.query.params

// Handle case where no params are provided
if (!encryptedParams) {
  throw createError({
    statusCode: 400,
    message: 'Missing required parameters',
  })
}

// Decrypt params
const { data: decryptedParams, error: decryptError } = await useFetch('/api/v1/validate_secure_url', {
  method: 'POST',
  body: { token: encryptedParams },
})

// Handle decryption error
if (decryptError.value) {
  error.value = 'Invalid or expired URL'
  loading.value = false
  throw createError({
    statusCode: 400,
    message: 'Invalid or expired URL',
  })
}

// Fetch deal data and set booking data
const { data: deal, status: dealStatus, error: dealError } = await useAsyncData(
  'deal',
  async () => {
    if (!decryptedParams.value?.payload) {
      throw new Error('No valid params available')
    }

    const payload = decryptedParams.value.payload

    // Make booking data available to child components
    provide('bookingData', {
      slug: payload.slug,
      departureDate: payload.departure_date,
      returnDate: payload.return_date,
      type: payload.type,
      step: payload.step,
    })

    return await queryCollection('deals')
      .where('slug', '=', payload.slug)
      .first()
  },
  {
    immediate: !!decryptedParams.value?.payload,
  },
)

// Handle deal fetch error
watchEffect(() => {
  if (dealStatus.value === 'error') {
    error.value = 'Failed to load deal information'
  }
})

// Update loading state
watchEffect(() => {
  if (dealStatus.value !== 'pending') {
    loading.value = false
  }
})

// Image utility
const img = useImage()

// Optional: Debug logging
watchEffect(() => {
  if (import.meta.dev) {
    console.log('Decrypted Params:', decryptedParams.value)
    console.log('Deal Status:', dealStatus.value)
    console.log('Deal Data:', deal.value)
  }
})
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Optional: Add some styling for the loading and error states */
.v-progress-circular {
  margin: 2rem;
}

.v-alert {
  margin: 2rem;
  width: 100%;
  max-width: 600px;
}
</style>
