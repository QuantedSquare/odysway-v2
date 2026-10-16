<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Retrouver un dossier
      </h1>
      <p class="text-body-2 text-primary-light-2 mt-1">
        Vous avez réservé avec une autre adresse email ? Rattachez-la : ses voyages rejoindront votre espace.
      </p>
    </div>

    <v-card class="pa-5 pa-md-6 rattacher">
      <v-alert
        v-if="resultat"
        :type="resultat.dossiers ? 'success' : 'info'"
        variant="tonal"
        class="mb-4"
      >
        <template v-if="resultat.contacts">
          Adresse rattachée. Vous avez maintenant {{ resultat.dossiers }} dossier{{ resultat.dossiers > 1 ? 's' : '' }} dans votre espace.
        </template>
        <template v-else>
          Adresse vérifiée, mais aucune réservation n'y est associée pour le moment. Contactez-nous si vous pensez qu'il s'agit d'une erreur.
        </template>
      </v-alert>
      <v-alert
        v-if="erreur"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ erreur }}
      </v-alert>

      <v-form
        v-if="etape === 'email'"
        @submit.prevent="envoyer"
      >
        <v-text-field
          v-model="email"
          label="Autre adresse email"
          type="email"
          variant="outlined"
        />
        <v-btn
          type="submit"
          color="secondary"
          rounded="pill"
          :loading="enCours"
        >
          Recevoir un code sur cette adresse
        </v-btn>
      </v-form>

      <v-form
        v-else
        @submit.prevent="verifier"
      >
        <p class="text-body-2 mb-3">
          Code envoyé à <b>{{ email }}</b> (valable 15 minutes).
        </p>
        <v-otp-input
          v-model="code"
          length="6"
          type="number"
          variant="outlined"
          autofocus
          @finish="verifier"
        />
        <div class="d-flex ga-2 mt-3">
          <v-btn
            type="submit"
            color="secondary"
            rounded="pill"
            :loading="enCours"
            :disabled="code.length !== 6"
          >
            Rattacher
          </v-btn>
          <v-btn
            variant="text"
            @click="etape = 'email'; code = ''"
          >
            Changer d'adresse
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <p class="text-caption text-primary-light-2">
      Vous ne retrouvez pas votre voyage ? Appelez-nous au <a
        href="tel:+33184807975"
        class="text-secondary"
      >+33 1 84 80 79 75</a>, nous le rattacherons avec vous.
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Retrouver un dossier — Odysway', robots: 'noindex, nofollow' })

const { api, chargerMoi } = useEspace()
const etape = ref('email')
const email = ref('')
const code = ref('')
const enCours = ref(false)
const erreur = ref(null)
const resultat = ref(null)

const texteErreur = err => err?.data?.statusMessage || err?.statusMessage || 'Une erreur est survenue. Réessayez dans un instant.'

const envoyer = async () => {
  erreur.value = null
  resultat.value = null
  enCours.value = true
  try {
    await api('rattachement/code', { method: 'POST', body: { email: email.value } })
    etape.value = 'code'
    code.value = ''
  }
  catch (err) {
    erreur.value = texteErreur(err)
  }
  finally {
    enCours.value = false
  }
}

const verifier = async () => {
  if (code.value.length !== 6 || enCours.value) return
  erreur.value = null
  enCours.value = true
  try {
    resultat.value = await api('rattachement/verifier', { method: 'POST', body: { email: email.value, code: code.value } })
    etape.value = 'email'
    email.value = ''
    code.value = ''
    await chargerMoi({ forcer: true })
  }
  catch (err) {
    erreur.value = texteErreur(err)
    code.value = ''
  }
  finally {
    enCours.value = false
  }
}

onMounted(() => chargerMoi().catch(() => {}))
</script>

<style scoped>
.rattacher {
  max-width: 560px;
}
</style>
