<template>
  <v-container
    id="faq-container"
    fluid
    class="position-relative px-0"
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
            v-if="faqBlock"
            cols="12"
            md="8"
            class="max-height-with-overflow"
          >
            <QuestionPanel
              v-for="item, index in faqBlock.faqList"
              :key="index"
              :item="item"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="px-0 pl-md-4"
          >
            <CtaCardSheet />
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

<style scoped>
.max-height-with-overflow {
  max-height: 900px;
  overflow: auto;
}
::-webkit-scrollbar {
  width: 5px;

}
/* Track */
::-webkit-scrollbar-track {
  border: 7px solid white;
  background: #C5C7C9;
  height:10px;
  border-radius: 9px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background-color: #0808b6;
    border: 6px solid lightgrey;
    border-radius: 9px;
    background-clip: content-box;
    height:10px;
    width:10px;
  }
</style>
