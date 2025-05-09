<template>
  <v-container
    id="faq-container"
    class="position-relative"
  >
    <v-img
      :src="img(backgroundImage, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      cover
      rounded="lg"
      :gradient="`to top, ${secondaryColor}, ${primaryColor}`"
    >
      <v-container
        class="pa-6 pa-md-16"
        max-width="1440px"
      >
        <v-row>
          <v-col>
            <h2 class="text-white text-shadow">
              Questions fréquentes
            </h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <QuestionPanel
              v-for="item, index in faqBlock.faqList"
              :key="index"
              :item="item"
            >
              <template #question>
                {{ item.question }}
              </template>
              <template #answer>
                <div v-dompurify-html="parseBoldText(item.answer)" />
              </template>
            </QuestionPanel>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-sheet
              class="text-start text-h5 text-white font-weight-bold bg-primary rounded-xl px-6 py-10 d-flex flex-column justify-start "
            >
              <v-avatar size="80">
                <v-img
                  :src="img(backgroundImage, { format: 'webp', quality: 70, height: 900, width: 1536 })"
                />
              </v-avatar>

              <span class="text-h3 text-md-h4 text-lg-h3 font-weight-bold my-6">
                Autres questions ?
                Notre équipe est là pour vous renseigner
              </span>
              <span class="text-h6 text-lg-h5 mb-8">
                Texte sous le titre
                <br>lorem
              </span>
              <v-btn-secondary
                height="62px"
                rounded="md"
                width="66%"
              >
                <span class="text-h6 text-lg-h5 text-wrap">
                  Contactez-nous
                </span>
              </v-btn-secondary>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-img>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
defineProps({
  backgroundImage: {
    type: String,
    default: '/images/b27a23f333a8c96567d46c123d1efb15.jpeg',
  },
  primaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0)',
  },
  secondaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0.8)',
  },
  faqBlock: {
    type: Object,
    required: true,
  },
})
</script>
