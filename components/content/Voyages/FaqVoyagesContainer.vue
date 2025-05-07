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
            <CtaColCard />
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
})
const { faqBlock } = inject('voyage')
</script>
