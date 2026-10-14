<template>
  <v-snackbar
    v-model="bandeauOuvert"
    :timeout="-1"
    location="left"
    :z-index="10001"
  >
    <v-row>
      <v-col cols="12">
        <span>
          Odysway utilise des cookies pour mesurer l’audience du site, comprendre comment il est utilisé et vous proposer des publicités personnalisées (Google, Meta). Vous pouvez accepter ou refuser, et changer d’avis à tout moment depuis le lien « Cookies » en bas de page. En savoir plus :
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
          @click="enregistrer('denied')"
        >
          Refuser
        </v-btn-secondary>
      </v-col>
      <v-col cols="auto">
        <v-btn-secondary
          @click="enregistrer('granted')"
        >
          Accepter
        </v-btn-secondary>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup>
const { bandeauOuvert, enregistrer } = useConsentement()
</script>
