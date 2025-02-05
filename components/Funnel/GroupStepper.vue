<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <FunnelStepsStepperHeader
          v-model="currentStep"
          :page="page"
          :skipper-mode="skipperMode"
        >
          <div class="funnel-stepper d-flex justify-center">
            <v-card
              class="border-width w-66"
              elevation="2"
            >
              <FunnelCardHeader
                v-if="currentStep !== 0 && currentStep !== 6"
                :titre="voyage.titre"
                :image="voyage.image_principale"
              />
              <v-row class="ma-0 pa-0">
                <v-col
                  cols="12"
                  :md="currentStep === 6 ? 6 : 12"
                  class="pa-0"
                >
                  <v-stepper-window>
                    <v-stepper-window-item>
                      <FunnelStepsSkipper
                        v-model="skipperMode"
                        :page="page"
                      />
                    </v-stepper-window-item>
                    <v-stepper-window-item>
                      <FunnelStepsDetails v-if="skipperMode === 'normal'" />
                      <FunnelStepsCalendly
                        v-else
                        :titre="voyage.titre"
                        :page="page"
                      />
                    </v-stepper-window-item>
                    <v-stepper-window-item>
                      coucou244
                    </v-stepper-window-item>
                  </v-stepper-window>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-stepper-actions
                  next-text="Suivant"
                  prev-text="Précédent"
                  @click:next="currentStep++"
                  @click:prev="currentStep--"
                />
              </v-card-actions>
            </v-card>
          </div>
        </FunnelStepsStepperHeader>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const page = {
  fields: {
    devis_rdv_text: '<p>Merci de votre confiance ! L\'aventure peut commencer ! Si vous le souhaitez, vous avez la possibilité de prendre un rendez-vous téléphonique avec l\'un de nos conseillers. Nous répondrons à toutes vos questions sur le voyage.</p>',
    fil_dariane_devis: {
      step_1: 'Votre voyage',
      step_2: 'Etape 2',
      step_3: 'Etape 3',
      step_final_rdv: 'Rendez-vous',
    },
    first_step: {
      title: 'Où en êtes vous dans la préparation de ce voyage ?',
      option_1: 'Je souhaite poser une option / réserver ce voyage',
      option_2: 'Je souhaite poser une option / réserver ce voyage',
      option_3: 'Je souhaite prendre un rendez-vous avec un conseiller voyage',
      option_4: 'Je ne sais pas encore',
    },
  },
}
const currentStep = ref(0)
const skipperMode = ref('normal')

const voyage = {
  titre: 'À bord du train de la Route de la Soie : expériences immersives et nuits en yourte en Ouzbékistan',
  image_principale: 'https://cdn.buttercms.com/HJtGmNQWuOz2HRQx1uA7',
}
</script>

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
