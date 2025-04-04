<template>
  <v-container class="rounded-lg bg-primary">
    <v-form v-model="model">
      <v-row>
        <v-col
          cols="12"
          class="text-subtitle-1 text-md-h6 font-weight-bold"
        >
          Décrivez-nous votre projet, un conseiller Odysway reviendra vers vous avec un devis personnalisé
        </v-col>
        <v-col
          cols="12"
          class="text-subtitle-1 text-md-h6 font-weight-bold"
        >
          Combien de participants ?
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="nbAdults"
            label="Nombres d'adultes"
            :items="selectOptions(1, 9)"
            variant="solo"
            bg-color="white"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="nbChildren"
            label="Nombres d'enfants"
            :items="selectOptions(0, 9)"
            variant="solo"
            bg-color="white"
          />
        </v-col>
        <v-col
          cols="12"

          class="d-flex justify-center"
        >
          <v-btn-secondary
            color="white"
            @click="navigateToIndivCheckout"
          >
            demander un devis
          </v-btn-secondary>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
const { deal } = defineProps({
  deal: {
    type: Object,
    required: true,
  },
})

const model = defineModel()

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}
const nbAdults = ref(1)
const nbChildren = ref(0)

console.log('nb adults ', nbAdults.value)

const navigateToIndivCheckout = () => {
  navigateTo({
    path: '/devis',
    query: { slug: deal.slug, nbAdults: nbAdults.value, nbChildren: nbChildren.value },
  })
}
</script>
