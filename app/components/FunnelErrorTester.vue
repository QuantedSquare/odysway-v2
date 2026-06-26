<template>
  <div
    v-if="visible"
    class="funnel-error-tester"
  >
    <v-btn
      v-if="!open"
      size="small"
      color="error"
      class="toggle"
      :prepend-icon="mdiBugOutline"
      @click="open = true"
    >
      Test erreurs
    </v-btn>

    <v-card
      v-else
      class="panel pa-3"
      elevation="10"
      width="280"
    >
      <div class="d-flex align-center justify-space-between mb-2">
        <strong class="text-caption text-uppercase">Test erreurs funnel</strong>
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click="open = false"
        >
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
      </div>

      <p class="text-caption text-medium-emphasis mb-2">
        {{ isAdmin ? `Admin : ${adminEmail}` : 'Mode dev' }} — chaque bouton génère un report réel (console + Slack si configuré).
      </p>

      <v-text-field
        v-model="testDealId"
        density="compact"
        variant="outlined"
        hide-details
        label="Deal ID (test)"
        class="mb-3"
      />

      <div class="d-flex flex-column ga-2">
        <v-btn
          v-for="t in tests"
          :key="t.code"
          size="small"
          variant="tonal"
          :color="t.color"
          :loading="loadingCode === t.code"
          class="justify-start text-none"
          @click="run(t)"
        >
          {{ t.label }}
        </v-btn>
      </div>

      <v-alert
        v-if="lastStatus"
        :type="lastStatus.type"
        density="compact"
        variant="tonal"
        class="mt-3 text-caption"
      >
        {{ lastStatus.text }}
      </v-alert>
    </v-card>
  </div>
</template>

<script setup>
import { mdiClose, mdiBugOutline } from '@mdi/js'

const config = useRuntimeConfig()
const route = useRoute()
const { report, reportApiError, setContext } = useFunnelReporter()

const visible = ref(false)
const open = ref(false)
const isAdmin = ref(false)
const adminEmail = ref('')
const loadingCode = ref(null)
const lastStatus = ref(null)
const testDealId = ref('999999')

// Gate: visible for logged-in @odysway.com admins (booking session cookie) or
// in any non-production environment for local testing.
onMounted(async () => {
  const isDev = config.public.environment !== 'production'
  try {
    const res = await $fetch('/api/v1/auth/check')
    if (res?.success) {
      isAdmin.value = true
      adminEmail.value = res.user?.email || ''
    }
  }
  catch {
    // not logged in — fall through to dev gate
  }
  visible.value = isAdmin.value || isDev
})

// Seed the funnel context so reports carry a (test) dealId + the real URL.
const seedContext = () => {
  setContext({
    dealId: testDealId.value || undefined,
    email: 'admin-test@odysway.com',
    voyageSlug: route.query.voyage || undefined,
    type: route.query.type || undefined,
  })
}

// A "server" test fires a real failing request; reportApiError merges the
// precise origin the endpoint attached (funnelCreateError) into a single report.
const callAndReport = async (fn, step) => {
  try {
    await fn()
    return false
  }
  catch (err) {
    reportApiError(err, { step })
    return true
  }
}

const tests = [
  {
    code: 'TEST_CLIENT_ISO_MISSING',
    label: 'Client · champ iso manquant',
    color: 'warning',
    fire: () => report({
      code: 'DETAILS_FIELDS_INCOMPLETE',
      step: 'details',
      severity: 'warning',
      origin: { field: 'isoContact', received: null, expected: 'pays (iso) renseigné' },
      message: '[TEST] Champ iso manquant à l\'étape Détails',
      userMessage: '[TEST] Merci de renseigner votre pays.',
    }),
  },
  {
    code: 'TEST_CLIENT_FATAL',
    label: 'Client · erreur fatale',
    color: 'error',
    fire: () => report({
      code: 'TEST_FATAL',
      step: 'unknown',
      severity: 'fatal',
      origin: { field: 'demo', received: undefined },
      message: '[TEST] Erreur fatale simulée depuis le menu admin',
    }),
  },
  {
    code: 'TEST_SERVER_ZOD',
    label: 'Serveur · validation Zod (/ac/deals)',
    color: 'deep-purple',
    fire: () => callAndReport(
      () => apiRequest('/ac/deals', 'post', { title: 'TEST' }),
      'details',
    ),
  },
  {
    code: 'TEST_SERVER_STRIPE',
    label: 'Serveur · Stripe booked_date introuvable',
    color: 'indigo',
    fire: () => callAndReport(
      () => $fetch('/api/v1/stripe?bookedId=__test_invalid__', { method: 'POST', body: {} }),
      'payment',
    ),
  },
  {
    code: 'TEST_SERVER_CHAPKA',
    label: 'Serveur · devis assurance KO',
    color: 'teal',
    fire: () => callAndReport(
      () => apiRequest('/chapka/quote', 'post', {}),
      'insurances',
    ),
  },
  {
    code: 'TEST_SERVER_DATE',
    label: 'Serveur · date introuvable',
    color: 'blue-grey',
    fire: () => callAndReport(
      () => apiRequest('/booking/date/__test_invalid__'),
      'init',
    ),
  },
]

const run = async (t) => {
  loadingCode.value = t.code
  lastStatus.value = null
  seedContext()
  try {
    await t.fire()
    lastStatus.value = { type: 'success', text: `Report envoyé : ${t.label}` }
  }
  catch (err) {
    lastStatus.value = { type: 'error', text: `Échec du test : ${err?.message || err}` }
  }
  finally {
    loadingCode.value = null
  }
}
</script>

<style scoped>
.funnel-error-tester {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 2147483000;
}

.panel {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
