<template>
  <v-footer class="position-relative">
    <v-img
      class="footer-bg-img"
      :src="img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })"
      :lazy-src="img('/logos/odysway-text.png', { format: 'webp', quality: 10, width: 1024, height: 400 })"
      :srcset="`${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })} 1024w, ${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 640, height: 400 })} 640w`"
      sizes="(max-width: 600px) 480px, 1024px"
      cover
      loading="lazy"
      alt="Odysway texte en fond, en bas de page"
      width="100%"
      height="400"
    />
    <v-container
      v-if="footer"
      :fluid="width < 1440"
    >
      <v-row
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="3"
          class="d-flex flex-column align-start align-md-start justify-space-between ga-6"
        >
          <v-img
            :src="img(OdyswayFooter, { format: 'webp', quality: 70, width: 640 })"
            :lazy-src="img(OdyswayFooter, { format: 'webp', quality: 10, width: 640 })"
            :srcset="`${img(OdyswayFooter, { format: 'webp', quality: 70, width: 640 })} 640w, ${img(OdyswayFooter, { format: 'webp', quality: 70, width: 1024 })} 1024w`"
            sizes="(max-width: 600px) 480px, 640px"
            loading="lazy"
            width="160"
            height="44px"
            alt="Logo d'Odysway"
          />
          <span class="text-h5 text-grey">
            {{ footer.logo.description }}

          </span>
          <div>
            <SocialsContainerButtons class="ga-4" />
          </div>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-img
            rounded="lg"
            cover
            max-height="270"
            :src="img(footer.team.image, { format: 'webp', quality: 100, width: 320, height: 270 })"
            :lazy-src="img(footer.team.image, { format: 'webp', quality: 10, width: 320, height: 270 })"
            :srcset="`${img(footer.team.image, { format: 'webp', quality: 70, width: 320, height: 270 })} 320w, ${img(footer.team.image, { format: 'webp', quality: 70, width: 640, height: 270 })} 640w`"
            sizes="(max-width: 600px) 480px, 320px"
            loading="lazy"
            alt="Image de l'équipe"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column align-center align-md-start justify-space-between ga-6 ga-md-14"
        >
          <h5 class="text-h4 font-weight-bold">
            {{ footer.contact.ctaText }}
          </h5>
          <div class="d-flex justify-start align-center align-md-center ga-2">
            <div class="custom-chip font-weight-bold text-primary text-no-wrap">
              {{ footer.contact.phone }}
            </div>
            <div class="custom-chip font-weight-bold text-primary text-no-wrap">
              {{ footer.contact.email }}
            </div>
          </div>
          <v-btn
            color="secondary"
            height="62"
            width="360"
            class="font-weight-bold"
            :to="footer.contact.buttonContact.lien"
          >
            {{ footer.contact.buttonContact.text }}
          </v-btn>
        </v-col>
      </v-row>
      <v-divider
        thickness="2"
        class="my-16"
      />
      <v-row class="mb-16 pb-16 text-primary">
        <v-col
          cols="6"
          md="3"
        >
          <h5 class="text-h4 font-weight-bold mb-10">
            {{ footer.linksList.colonne1.title }}
          </h5>
          <div class="d-flex flex-column ga-2">
            <NuxtLink
              v-for="link, index in footer.linksList.colonne1.links"
              :key="`${link.label}-${index}`"
              :to="link.to"
              class="text-grey"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </v-col>
        <v-col
          cols="6"
          md="3"
        >
          <h5 class="text-h4 font-weight-bold mb-10">
            {{ footer.linksList.colonne1.title }}
          </h5>
          <div class="d-flex flex-column ga-2">
            <NuxtLink
              v-for="link, index in footer.linksList.colonne1.links"
              :key="`${link.label}-${index}`"
              :to="link.to"
              class="text-grey"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </v-col>
        <v-divider class="my-8 d-md-none" />
        <v-col
          cols="6"
          md="3"
        >
          <h5 class="text-h4 font-weight-bold mb-10">
            {{ footer.linksList.colonne2.title }}
          </h5>
          <div class="d-flex flex-column ga-2">
            <NuxtLink
              v-for="link, index in footer.linksList.colonne2.links"
              :key="`${link.label}-${index}`"
              :to="link.to"
              class="text-grey"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </v-col>
        <v-col
          cols="6"
          md="3"
        >
          <h5 class="text-h4 font-weight-bold mb-10">
            {{ footer.linksList.colonne4.title }}
          </h5>
          <div class="d-flex flex-column">
            <p class="mb-3 font-weight-bold">
              {{ footer.linksList.colonne4.name }}
            </p>
            <p class="text-grey">
              {{ footer.linksList.colonne4.address }}
            </p>
            <p class="text-grey">
              {{ footer.linksList.colonne4.city }}
            </p>
          </div>
        </v-col>
      </v-row>
      <!-- <v-row align="center">
        <v-col
          cols="12"
          md="5"
          class="d-flex justify-start text-grey"
        >
          <span class="text-center text-md-left">© Copyright 2025 - Tous droits réservés à Odysway</span>
        </v-col>
        <v-col
          cols="12"
          md="7"
          class="text-center text-md-right"
        >
          <v-btn
            variant="text"
          >
            <v-img
              :src="img('/icons/gb.svg', { format: 'webp', quality: 70, width: 640 })"
              width="20px"
              contain
            />
          </v-btn>
          <v-btn
            v-for="policy in policies"
            :key="policy.name"
            :to="policy.link"
            variant="text"
            class="text-overline"
          >
            {{ policy.name }}
          </v-btn>
        </v-col>
      </v-row> -->
    </v-container>
  </v-footer>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

import OdyswayFooter from '~/assets/img/odysway-text.png'

const { width } = useDisplay()
const { footer } = useAppConfig()

const img = useImage()

// const policies = ref([
//   { name: 'FAQ',
//     link: '/faq',
//   },
//   { name: 'Mentions légales',
//     link: '/mentions-legales',
//   },
//   { name: 'CGV',
//     link: '/conditions-generales-de-vente',
//   },
//   { name: 'Données personnelles',
//     link: '/politique-de-confidentialite',
//   },
// ])
</script>

<style scoped>
.footer-bg-img {
  position: absolute;
  top: 20%;
  left: 0;
  width: 100% !important;
  height: 400px !important;
  z-index: 0;
  object-fit: cover;
  pointer-events: none;
}
@media screen and (max-width: 768px) {
  .footer-bg-img {
    height: 130px !important;
  }
}
.v-footer.position-relative {
  position: relative;
  overflow: hidden;
}
.custom-chip {
  background-color: rgba(var(--v-theme-grey-light-2));
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
}
</style>
