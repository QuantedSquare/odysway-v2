<template>
  <v-container>
    <v-row justify="center">
      <v-col
        v-if="status === 'success' && voyage"
        cols="12"
        xl="10"
      >
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            v-if="voyage"
            cols="12"
            sm="6"
            md="3"
          >
            <v-img
              rounded="xl"
              class="position-relative"
              :src="voyage.imgSrc1.src"
              :alt="voyage.imgSrc1.alt"
            >
              <div class="d-flex justify-end mt-4 mr-1 position-absolute  right-0">
                <h3
                  v-if="voyage"
                  class="text-white mb-4 ml-3 text-shadow"
                >
                  {{ voyage.title }}
                </h3>
              </div>
            </v-img>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="9"
          >
            <div>
              <slot
                v-if="isOption"
                name="title_option"
              />
              <slot
                v-else
                name="title_default"
              />
            </div>
          </v-col>
        </v-row>
        <v-row

          class="mt-8"
        >
          <v-col cols="12">
            <slot
              v-if="isOption"
              name="accroche_option"
            />
            <slot
              v-else
              name="accroche_default"
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col
            cols="auto"
            class="mt-8"
          >
            <v-btn-secondary
              to="/thematiques"
              nuxt
              size="x-large"
            >
              Retour aux voyages
            </v-btn-secondary>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        v-else-if="status === 'pending'"
        cols="12"
      >
        <v-skeleton-loader type="card" />
      </v-col>
      <v-col
        v-else
        cols="12"
        class="d-flex flex-column justify-center align-center ga-2"
      >
        <h3 v-if="voyage">
          {{ voyage.title }}
        </h3>
        <slot
          name="error"
        />
        <NuxtLink
          to="/thematiques"
        >
          Retour aux voyages
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const isOption = ref(route.query.isOption === 'true')
const { data: voyage, status } = useAsyncData(route.query.voyage, async () => {
  const query = await queryCollection('deals').where('slug', '=', route.query.voyage).first()
  return query
})

onMounted(() => {
  // if (route.query.amount) {
  //     const purchaseData = {
  //       currency: 'EUR',
  //       value: +route.query.amount
  //     }

  //     if (this.$fb.isEnabled) {
  //       this.$fb.track('Purchase', purchaseData)
  //     } else {
  //       // This could be a nextTick maybe.
  //       // It's to counter the fact that this mounted happend after
  //       // the default layout monted that enable facebook.
  //       setTimeout(() => {
  //         this.$fb.track('Purchase', purchaseData)
  //       }, 100)
  //     }

  //     // if (this.$route.query.amount) {
  //     this.$ga.event({
  //       eventCategory: 'Transaction',
  //       eventAction: 'View_Confirmation',
  //       eventLabel: this.$route.query.nbVoyageur || 1,
  //       eventValue: +this.$route.query.amount || 0
  //     })
  //   }
})
</script>

<style scoped>
.position-absolute{
  position:absolute;
  bottom: 0;
}

.position-relative {
  position: relative;
}
</style>
