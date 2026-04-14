<template>
  <v-snackbar
    v-model="show"
    :timeout="-1"
    location="left"
  >
    <v-row>
      <v-col cols="12">
        <span>
          Odysway utilise des cookies pour vous offrir une expérience utilisateur de qualité, mesurer l’audience et vous proposer des publicités personnalisées. En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies dans les conditions prévues par notre
          <NuxtLink
            class="text-white"
            to="/politique-de-confidentialite"
            target="_blank"
          >politique de confidentialité</NuxtLink>.</span>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="auto">
        <v-btn-secondary
          variant="outlined"
          @click="refuseCookies"
        >
          Refuser
        </v-btn-secondary>
      </v-col>
      <v-col cols="auto">
        <v-btn-secondary
          @click="acceptCookies"
        >
          Accepter
        </v-btn-secondary>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup>
const show = ref(false)
const optOut = ref(false)

onMounted(() => {
  const cookie = useCookie('odysway_employee_optout')
  optOut.value = cookie.value === 1
  const consent = localStorage.getItem('consent')
  if (consent !== 'granted') {
    show.value = true
  }
})

function acceptCookies() {
  show.value = false
  if (!optOut.value) {
    // #TODO: add code to accept cookies
  }
  localStorage.setItem('consent', 'granted')
}

function refuseCookies() {
  show.value = false
  if (!optOut.value) {
    // #TODO: add code to refuse cookies
  }
  localStorage.setItem('consent', 'denied')
}
</script>
