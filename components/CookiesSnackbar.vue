<template>
  <v-snackbar
    v-model="consentBar"
    :vertical="$vuetify.display.smAndDown"
    :centered="$vuetify.display.smAndDown"
    :left="$vuetify.display.mdAndUp"
    :timeout="-1"
  >
    <v-row>
      <v-col cols="12">
        <span>
          Odysway utilise des cookies pour vous offrir une expérience utilisateur de qualité, mesurer l’audience et vous proposer des publicités personnalisées. En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies dans les conditions prévues par notre
          <NuxtLink
            class="text-primary"
            to="/politique-de-confidentialite"
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
const consentBar = ref(true)

onMounted (() => {
  if (!localStorage.getItem('consent')) {
    setTimeout(() => {
      consentBar.value = true
    }, 100)
  }
  else {
    consentBar.value = false
  }

  // TODO : plugin to add ?
  // if (this.$blogr) { this.$blogr() }

  // const userUTMs = []

  // Object.keys(route.query).forEach((queryParam) => {
  //   if (queryParam.toLowerCase().includes('utm')) {
  //     userUTMs.push(queryParam + '=' + route.query[queryParam])
  //   }
  // })

  // if (userUTMs.length) {
  //   localStorage.setItem('utmSource', userUTMs.join('&'))
  // }

  // if (!window.dataLayer) {
  //   window.dataLayer = window.dataLayer || []
  // }
})

function acceptCookies() {
  consentBar.value = false
  localStorage.setItem('consent', 'agree')
}

function refuseCookies() {
  consentBar.value = false
  localStorage.setItem('consent', 'false')
}

// TODO: add pixels and ga
// function activePixels() {
//   if (this.$sendinblue) { this.$sendinblue() }
//   if (this.$hotjar) { this.$hotjar() }

//   this.consentBar = false
//   this.$fb.enable()
//   this.$fb.track('PageView')
// }

// function captureOutboundLink(link) {
//   const location = window.location.href

//   this.$ga.event({
//     eventCategory: 'Header Link',
//     eventAction: 'Click',
//     eventLabel: `Header link from ${location} to ${link}`,
//   })
// }
</script>
