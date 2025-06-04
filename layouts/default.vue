<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
    />
    <ClientOnly>
      <LazyDrawer
        v-if="width < 960"
        v-model="drawer"
      />
    </ClientOnly>

    <v-main class="main-content">
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>
    <!-- #TODO Passer les info de la faq en dynamique sur nuxt content -->
    <!-- FAQ Section -->
    <FaqContainer>
      <template #section-title>
        <TitleContainer>
          <template #title>
            Questions fréquentes
          </template>
        </TitleContainer>
      </template>
      <template #faq>
        <QuestionPanel>
          <template #question>
            Odysway est-elle une agence de voyage ?
          </template>
          <template #answer>
            Odysway est une agence de voyage certifiée et immatriculée auprès d'Atout France, et dispose d'une garantie financière APST, ainsi qu'une d'une assurance professionelle. Avec Odysway, voyagez les yeux fermés ! Les équipes Odysway sont très réactives et vous accompagnent avant votre voyage, sur place et au retour de votre voyage.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            En quoi Odysway se différencie des autres agences de voyage ?
          </template>
          <template #answer>
            Chez Odysway, nous pensons que la vie est rythmée par les expériences que nous vivons ! Des expériences qui nous marquent, et qui nous laissent des souvenirs gravés à jamais. C'est pourquoi nous avons décidé de créer la première agence qui propose des séjours en immersion, et créés sur place par les équipes d'Odysway, afin de proposer à nos voyageurs une nouvelle façon de voyager : plus authentique, hors des sentiers battus et respectueuse de l'environnement et des populations locales.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            Quelle est la démarche responsable d'Odysway ?
          </template>
          <template #answer>
            Vous pouvez consulter notre page démarche responsable pour plus d'informations.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            Avec qui vais-je voyager ?
          </template>
          <template #answer>
            Chez Odysway, nous proposons deux options pour voyager :<br><br>
            1. Vous choisissez vos propres dates, pour vivre le voyage seul, en couple, en famille, ou encore entre amis. Le séjour est alors privatisé pour vous et votre groupe.<br>
            2. Vous choisissez de partir en groupe (maximum 8 voyageurs) sur des dates prédéfinies par Odysway, pour allier rencontres avec d'autres voyageurs et prix réduits.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            Quelles sont les disponibilités des voyages ?
          </template>
          <template #answer>
            Pour les voyages individuels, vous choisissez vos propres dates. Un de nos conseillers vous répondra en vous indiquant le tarif et la disponibilité sur vos dates. Pour les voyages de groupes, les dates sont prédéfinies (généralement une date par mois), et vous pouvez réserver directement en ligne.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            Comment réserver un voyage avec Odysway ?
          </template>
          <template #answer>
            Après avoir choisi le voyage qui vous intéresse, cliquez sur le bouton « Demander un devis » ou « s'inscrire pour ce voyage » pour un voyage en groupe. Vous pourrez alors choisir vos dates et procéder au règlement de l'acompte, qui confirmera votre réservation pour le voyage. Un conseiller voyage Odysway prendra alors contact avec vous par téléphone pour vous aider à préparer votre voyage.
          </template>
        </QuestionPanel>
        <QuestionPanel>
          <template #question>
            Suis-je assuré pour mon voyage avec Odysway ?
          </template>
          <template #answer>
            Lors de l'achat d'un voyage, il est vivement recommandé d'être assuré. Une assurance annulation permet de couvrir le risque financier avant le voyage, et une assistance rapatriement vous protège pendant le voyage. Il est important d'y réfléchir dès la réservation car vous n'aurez qu'un délai de 48h maximum à partir de votre règlement pour y souscrire.
          </template>
        </QuestionPanel>
      </template>
    </FaqContainer>
    <!-- End FAQ Section -->

    <!-- Info Section -->
    <v-container
      :fluid="width > 600"
      class="pt-0"
    >
      <ColorContainer
        color="secondary"
        :white-text="true"
      >
        <InfoContainer :white-text="true">
          <template #title>
            Une agence fiable et engagée
          </template>
          <template #description>
            Fringilla ut morbi tincidunt augue interdum velit euismod cursus vitae congue mauris rhoncus aenean.
          </template>
          <template #bottom>
            <PartenairesContainer />
          </template>
        </InfoContainer>
      </ColorContainer>
      <LazyTopTravelsTabs />
    </v-container>
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const drawer = ref(false)
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: -60px;
  right: 5px;
  z-index: 10000;
}

.main-content {
  --v-layout-top: 90px!important;
  --v-layout-bottom: 0px;
}
@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 60px!important;
  }
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
