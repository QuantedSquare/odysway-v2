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
            type="info"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            <div class="text-caption">
              <strong>Note:</strong> This test calls the webhook directly from your browser.
              <ul class="mt-2 ml-4">
                <li><strong>On localhost:</strong> Tests <code>localhost:3000</code></li>
                <li><strong>On preview deployments:</strong> May be blocked by Vercel Authentication</li>
                <li><strong>On production:</strong> Works normally</li>
              </ul>
              For preview deployments, configure the webhook in Sanity to use your production URL instead.
            </div>
          </v-alert>

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

            <v-select
              v-model="testType"
              label="Content Type"
              :items="contentTypes"
              item-title="label"
              item-value="value"
              hint="Select the Sanity content type to test"
              persistent-hint
            />

            <v-text-field
              v-if="requiresSlug"
              v-model="testSlug"
              label="Slug (if applicable)"
              :hint="slugHint"
              persistent-hint
            />

            <v-chip
              v-if="affectedPaths.length > 0"
              class="mb-2"
              color="info"
              variant="outlined"
            >
              Will revalidate: {{ affectedPaths.join(', ') }}
            </v-chip>

            <v-btn
              color="primary"
              size="large"
              :loading="testing"
              :disabled="!webhookSecret || (requiresSlug && !testSlug)"
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
const webhookSecret = ref('mY7f1j2Q1RskslUV6o4wU6tzE32xqTXBx2N4t66jEe8')
const testType = ref('voyage')
const testSlug = ref('photographie-animaliere-vosges')
const webhookResponse = ref(null)
const webhookError = ref(null)
const testing = ref(false)

// Content types list
const contentTypes = [
  { label: '🧳 Voyage', value: 'voyage', requiresSlug: true, exampleSlug: 'bali' },
  { label: '📝 Blog', value: 'blog', requiresSlug: true, exampleSlug: 'guide-voyage-sri-lanka' },
  { label: '🌍 Destination', value: 'destination', requiresSlug: true, exampleSlug: 'sri-lanka' },
  { label: '🎯 Category', value: 'category', requiresSlug: true, exampleSlug: 'nature-et-grands-espaces' },
  { label: '✨ Experience', value: 'experience', requiresSlug: true, exampleSlug: 'photographie-animaliere' },
  { label: '🏠 Homepage', value: 'homePage', requiresSlug: false },
  { label: '🏢 Entreprise', value: 'entreprise', requiresSlug: false },
  { label: '✏️ Sur Mesure', value: 'surMesure', requiresSlug: false },
  { label: '👁️ Vision Voyage', value: 'visionVoyageOdysway', requiresSlug: false },
  { label: '🔒 Privacy Policy', value: 'privacyPolicy', requiresSlug: false },
  { label: '⚖️ Legal Mentions', value: 'legalMentions', requiresSlug: false },
  { label: '💳 Chèques Vacances', value: 'chequesVacances', requiresSlug: false },
  { label: '📄 CGV', value: 'conditionsGeneralesVente', requiresSlug: false },
  { label: '✅ Confirmation', value: 'confirmation', requiresSlug: false },
  { label: '🎁 Offre Cadeau', value: 'offreCadeau', requiresSlug: false },
  { label: '👔 Recruitment', value: 'recruitment', requiresSlug: false },
  { label: '❓ FAQ', value: 'faq', requiresSlug: false },
  { label: '⭐ Avis Voyageurs', value: 'avisVoyageurs', requiresSlug: false },
  { label: '📧 Page Contact', value: 'page_contact', requiresSlug: false },
  { label: '🔍 Search Page', value: 'search', requiresSlug: false },
  { label: '🛒 Checkout', value: 'checkout', requiresSlug: false },
  { label: '📋 Devis', value: 'devis', requiresSlug: false },
  { label: '🧭 Header (Global)', value: 'header', requiresSlug: false },
  { label: '👣 Footer (Global)', value: 'footer', requiresSlug: false },
  { label: '📬 Newsletter', value: 'newsletter', requiresSlug: false },
  { label: '🎯 CTAs', value: 'ctas', requiresSlug: false },
  { label: '🃏 Voyage Card', value: 'voyage_card', requiresSlug: false },
  { label: '👤 Team Member', value: 'teamMember', requiresSlug: false },
  { label: '💬 Review', value: 'review', requiresSlug: false },
]

// Computed properties
const selectedContentType = computed(() => contentTypes.find(ct => ct.value === testType.value))
const requiresSlug = computed(() => selectedContentType.value?.requiresSlug || false)
const slugHint = computed(() => {
  if (!requiresSlug.value) return ''
  const example = selectedContentType.value?.exampleSlug
  return example ? `Example: ${example}` : 'Enter the slug for this content'
})

// Compute affected paths based on selected type
const affectedPaths = computed(() => {
  const type = testType.value
  const slug = testSlug.value

  if (type === 'voyage' && slug) return [`/voyages/${slug}`, '/search', '/prochains-departs']
  if (type === 'blog' && slug) return [`/${slug}`, '/blog']
  if (type === 'destination' && slug) return [`/destinations/${slug}`, '/destinations', '/search']
  if (type === 'category' && slug) return [`/thematiques/${slug}`, '/thematiques']
  if (type === 'experience' && slug) return [`/experiences/${slug}`, '/experiences']
  if (type === 'homePage') return ['/']
  if (type === 'entreprise') return ['/entreprise']
  if (type === 'surMesure') return ['/sur-mesure']
  if (type === 'visionVoyageOdysway') return ['/vision-voyage-odysway']
  if (type === 'privacyPolicy') return ['/politique-de-confidentialite']
  if (type === 'legalMentions') return ['/mentions-legales']
  if (type === 'chequesVacances') return ['/cheques-vacances']
  if (type === 'conditionsGeneralesVente') return ['/conditions-generales-de-vente']
  if (type === 'confirmation') return ['/confirmation']
  if (type === 'offreCadeau') return ['/offre-cadeau']
  if (type === 'recruitment') return ['/nous-recrutons']
  if (type === 'faq') return ['/faq']
  if (type === 'avisVoyageurs') return ['/avis-voyageurs']
  if (type === 'page_contact') return ['/contact']
  if (type === 'search') return ['/search']
  if (type === 'checkout') return ['/checkout']
  if (type === 'devis') return ['/devis']
  if (type === 'header') return ['/', '/destinations', '/thematiques', '/experiences', '/blog']
  if (type === 'footer') return ['/', '/contact']
  if (type === 'newsletter') return ['/']
  if (type === 'ctas') return ['/']
  if (type === 'voyage_card') return ['/search', '/destinations', '/thematiques', '/experiences']
  if (type === 'teamMember') return ['/vision-voyage-odysway']
  if (type === 'review') return ['/', '/avis-voyageurs']

  return []
})

// Test webhook function
async function testWebhook() {
  testing.value = true
  webhookResponse.value = null
  webhookError.value = null

  try {
    // Get the full URL for the webhook
    // For local testing, use localhost
    // For production testing, use your production domain
    const isDev = window.location.hostname === 'localhost'
    const baseUrl = isDev
      ? 'http://odysway.com/api/v1/webhooks/sanity/revalidate'
      : `${config.public.siteURL}/api/v1/webhooks/sanity/revalidate`

    console.log('🔗 Testing webhook:', baseUrl)

    // Build the webhook body
    const webhookBody = {
      _type: testType.value,
      _id: voyage.value?._id || 'test-id',
    }

    // Add slug if the content type requires it
    if (requiresSlug.value && testSlug.value) {
      webhookBody.slug = {
        current: testSlug.value,
      }
    }

    console.log('📤 Webhook payload:', webhookBody)

    // Call the webhook with proper headers
    const response = await $fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sanity-webhook-secret': webhookSecret.value,
      },
      body: webhookBody,
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
