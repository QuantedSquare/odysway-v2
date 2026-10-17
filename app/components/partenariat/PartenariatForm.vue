<template>
  <div
    class="form"
    :class="{ sent }"
  >
    <div
      v-if="!sent"
      class="form-body"
    >
      <h3>{{ content.formTitle }}</h3>
      <p v-if="content.formSubtitle">
        {{ content.formSubtitle }}
      </p>
      <form
        novalidate
        @submit.prevent="submit"
      >
        <div class="field">
          <label for="pf-concept">{{ label('concept') }}</label>
          <textarea
            id="pf-concept"
            v-model="form.concept"
            name="concept"
            :placeholder="placeholder('concept')"
            required
            minlength="10"
            maxlength="4000"
            :aria-invalid="!!errors.concept"
            :aria-describedby="errors.concept ? 'pf-concept-err' : undefined"
          />
          <span
            v-if="errors.concept"
            id="pf-concept-err"
            class="field-err"
          >{{ errors.concept }}</span>
        </div>
        <div class="field">
          <label for="pf-destination">{{ label('destination') }}</label>
          <input
            id="pf-destination"
            v-model="form.destination"
            name="destination"
            type="text"
            maxlength="300"
            :placeholder="placeholder('destination')"
          >
        </div>
        <div class="field">
          <label for="pf-communaute">{{ label('communaute') }}</label>
          <input
            id="pf-communaute"
            v-model="form.communaute"
            name="communaute"
            type="text"
            maxlength="300"
            :placeholder="placeholder('communaute')"
          >
        </div>
        <div class="field">
          <label for="pf-participants">{{ label('participants') }}</label>
          <input
            id="pf-participants"
            v-model="form.participants"
            name="participants"
            type="text"
            maxlength="120"
            :placeholder="placeholder('participants')"
          >
        </div>
        <div
          v-if="besoinOptions.length"
          class="field"
        >
          <label for="pf-besoin">{{ label('besoin') }}</label>
          <select
            id="pf-besoin"
            v-model="form.besoin"
            name="besoin"
          >
            <option
              v-for="opt in besoinOptions"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="pf-email">{{ label('email') }}</label>
          <input
            id="pf-email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            :placeholder="placeholder('email')"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'pf-email-err' : undefined"
          >
          <span
            v-if="errors.email"
            id="pf-email-err"
            class="field-err"
          >{{ errors.email }}</span>
        </div>
        <!-- Pot de miel, invisible pour un humain -->
        <div
          class="hp"
          aria-hidden="true"
        >
          <label for="pf-website">Site web</label>
          <input
            id="pf-website"
            v-model="form.website"
            name="website"
            type="text"
            tabindex="-1"
            autocomplete="off"
          >
        </div>
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Envoi…' : content.submitText }}
        </button>
        <p
          v-if="submitError"
          class="form-error"
          role="alert"
        >
          {{ submitError }}
        </p>
      </form>
      <p
        v-if="content.legal"
        class="form-legal"
      >
        {{ content.legal }}
      </p>
    </div>
    <div
      v-else
      class="form-done"
      role="status"
      tabindex="-1"
    >
      <b>{{ content.successTitle }}</b>
      <p>{{ content.successText }}</p>
    </div>
  </div>
</template>

<script setup>
import { stegaClean } from '@sanity/client/stega'

const props = defineProps({
  content: { type: Object, required: true },
})

const route = useRoute()
const { trackPartnershipRequest } = useGtmTracking()

const label = key => props.content.fields?.[key]?.label || key
const placeholder = key => props.content.fields?.[key]?.placeholder || ''
// Les options sont envoyées telles quelles à AC : sans le marquage stega.
const besoinOptions = computed(() => (props.content.besoinOptions || []).map(o => stegaClean(o)).filter(Boolean))

const form = reactive({
  concept: '',
  destination: '',
  communaute: '',
  participants: '',
  besoin: besoinOptions.value[0] || '',
  email: '',
  website: '',
})
const errors = reactive({ concept: '', email: '' })
const loading = ref(false)
const sent = ref(false)
const submitError = ref('')

const validate = () => {
  errors.concept = form.concept.trim().length >= 10 ? '' : 'Décrivez votre projet en quelques mots (10 caractères minimum).'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Adresse email invalide.'
  return !errors.concept && !errors.email
}

const utmString = () => Object.entries(route.query)
  .filter(([k]) => k.startsWith('utm_'))
  .map(([k, v]) => `${k}=${v}`)
  .join('&')

async function submit() {
  submitError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await apiRequest('/partenariat/demande', 'post', {
      ...form,
      sourceUrl: window.location.href,
      utm: utmString(),
    })
    trackPartnershipRequest(form.email.trim(), form.besoin)
    sent.value = true
  }
  catch {
    submitError.value = props.content.errorText || 'L\'envoi a échoué. Réessayez, ou écrivez-nous directement.'
  }
  finally {
    loading.value = false
  }
}
</script>
