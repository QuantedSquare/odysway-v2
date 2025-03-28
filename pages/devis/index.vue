<template>
  <v-container
    fluid
    class="mt-10 relative"
  >
    <v-img
      :src="img(deal.imgSrc2.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(deal.imgSrc2.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(deal.imgSrc2.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(deal.imgSrc2.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      :alt="deal.imgSrc2.alt"
      height="350px"
      cover
      class="absolute"
    />

    <v-row justify="center">
      <v-col
        v-if="pageStatus === 'success'"
        cols="12"
      >
        <FunnelStepsStepperHeader
          v-model="currentStep"
          :page="page"
          :skipper-mode="skipperChoice"
        >
          <v-row class="funnel-stepper d-flex justify-center">
            <v-col
              cols="12"
              class="d-flex justify-center"
            >
              <v-card
                class="border-width relative w-md-75 w-lg-50 w-xl-33 no-margin-window "
              >
                <v-stepper-window :model-value="currentStep">
                  <v-stepper-window-item :value="1">
                    <DevisSkipper
                      v-model="skipperChoice"
                      :page="page.first_step"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item :value="2">
                    coucou
                  </v-stepper-window-item>
                </v-stepper-window>
                <v-card-actions>
                  <v-stepper-actions
                    next-text="Suivant"
                    :prev-text="currentStep !== 0 ?'Précédent' : ''"
                    @click:next="nextStep()"
                    @click:prev="previousStep()"
                  >
                    <template #next>
                      <div>
                        <v-btn
                          color="secondary"
                          @click="nextStep"
                        >
                          Suivant
                        </v-btn>
                      </div>
                    </template>
                  </v-stepper-actions>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </FunnelStepsStepperHeader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const skipperChoice = ref('devis')
const currentStep = ref(1)

const { slug } = useRoute().query
console.log('slug', slug)
const route = useRoute()
const deal = await queryCollection('deals').where('slug', '=', slug).first()
const { data: page, status: pageStatus } = await useFetch('/api/v1/pages/' + route.name)
console.log('page', page)
const img = useImage()

const nextStep = () => {
  currentStep.value++
}
const previousStep = () => {
  currentStep.value--
}
</script>

<style scoped>
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>

<style scoped>
@media screen and (min-width: 768px) {
  .border-width {
    border-radius: 30px!important;
    height: fit-content!important;
  }
  .funnel-stepper{
    min-height: 50vh!important;
    padding: 2em;

  }
}
</style>
