<template>
  <div>
    <v-container class="py-8">
      <v-card class="mb-6 pa-4">
        <v-card-title class="text-h5">
          🔗 Webhook Tester
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Test the Sanity webhook to verify instant revalidation is working.
          </p>

          <v-alert
            v-if="webhookResponse"
            :type="webhookResponse.success ? 'success' : 'error'"
            class="mb-4"
            closable
            @click:close="webhookResponse = null"
          >
            <div class="font-weight-bold mb-2">
              {{ webhookResponse.success ? '✅ Webhook Success!' : '❌ Webhook Failed' }}
            </div>
            <div class="text-caption">
              {{ webhookResponse.message }}
            </div>
            <v-divider class="my-2" />
            <pre class="text-caption">{{ JSON.stringify(webhookResponse, null, 2) }}</pre>
          </v-alert>

          <v-alert
            v-if="webhookError"
            type="error"
            class="mb-4"
            closable
            @click:close="webhookError = null"
          >
            <div class="font-weight-bold mb-2">
              ❌ Error
            </div>
            <div>{{ webhookError }}</div>
          </v-alert>

          <div class="d-flex flex-column gap-2">
            <v-text-field
              v-model="webhookSecret"
              label="Webhook Secret (SANITY_WEBHOOK_SECRET)"
              type="password"
              hint="Enter your SANITY_WEBHOOK_SECRET from .env"
              persistent-hint
            />

            <v-text-field
              v-model="testSlug"
              label="Test Slug"
              :hint="`Will test revalidation for: /voyages/${testSlug}`"
              persistent-hint
            />

            <v-btn
              color="primary"
              size="large"
              :loading="testing"
              :disabled="!webhookSecret || !testSlug"
              @click="testWebhook"
            >
              🚀 Test Webhook
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="pa-4">
        <v-card-title>Sample Voyage Data</v-card-title>
        <v-card-text>
          <v-img
            v-if="voyage"
            :src="getImageUrl(voyage.imageUrl.asset._ref)"
            :lazy-src="getImageUrl(voyage.imageUrl.asset._ref)"
            alt="Voyage Image"
            height="300"
            cover
            class="mb-4"
          >
            <div class="d-flex align-center justify-center h-100">
              <h1 class="text-white text-shadow">
                {{ voyage.title }}
              </h1>
            </div>
          </v-img>
          <div v-if="voyage">
            <p><strong>Title:</strong> {{ voyage.title }}</p>
            <p><strong>Duration:</strong> {{ voyage.duration }}</p>
            <p><strong>Rating:</strong> {{ voyage.rating }}</p>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'blank',
})

const config = useRuntimeConfig()

// Fetch voyage data
const voyageQuery = /* groq */`
  *[_type == "voyage" && published == true] | order(title asc)[0] {
    _id,
    title,
    duration,
    rating,
    description,
    destinations[]->{_id, title},
    categories[]->{_id, title},
    pricing,
    "imageUrl": image,
    "slug": slug.current,
    ...,
    programmeBlock[]{
      title,
      badgeText,
      description,
      denivellation,
      road,
      night
    }
  }
`
const sanity = useSanity()
const { data: voyage } = await useAsyncData('voyage', () =>
  sanity.fetch(voyageQuery),
)

// Webhook testing state
const webhookSecret = ref('')
const testSlug = ref('photographie-animaliere-vosges')
const webhookResponse = ref(null)
const webhookError = ref(null)
const testing = ref(false)

// Test webhook function
async function testWebhook() {
  testing.value = true
  webhookResponse.value = null
  webhookError.value = null

  try {
    // Get the full URL for the webhook
    const baseUrl = 'https://odysway-v2-git-sanity-dev-quanted-square.vercel.app/api/v1/webhooks/sanity/revalidate'// config.public.siteURL

    console.log('🔗 Testing webhook:', baseUrl)

    // Call the webhook with proper headers
    const response = await $fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sanity-webhook-secret': webhookSecret.value,
      },
      body: {
        _type: 'voyage',
        _id: voyage.value?._id || 'test-id',
        slug: {
          current: testSlug.value,
        },
      },
    })

    console.log('✅ Webhook response:', response)
    webhookResponse.value = response
  }
  catch (error) {
    console.error('❌ Webhook error:', error)
    webhookError.value = error.data?.message || error.message || 'Unknown error occurred'

    // If it's a 401, likely wrong secret
    if (error.statusCode === 401) {
      webhookError.value = '🔒 Unauthorized: Check your webhook secret'
    }
  }
  finally {
    testing.value = false
  }
}
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
</style>
