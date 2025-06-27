<template>
  <v-footer class="position-relative d-flex justify-center mt-md-10">
    <v-img
      class="footer-bg-img "
      :src="img(OdyswayFooter, { format: 'webp', quality: 70, width: 1024, height: 400 })"
      :lazy-src="img(OdyswayFooter, { format: 'webp', quality: 10, width: 1024, height: 400 })"
      :srcset="`${img(OdyswayFooter, { format: 'webp', quality: 70, width: 1024, height: 400 })} 1024w, ${img(OdyswayFooter, { format: 'webp', quality: 70, width: 640, height: 400 })} 640w`"
      sizes="(max-width: 600px) 480px, 1024px"
      cover
      loading="lazy"
      alt="Odysway texte en fond, en bas de page"
      width="100%"
      height="400"
    />
    <div class="mx-md-5 max-container-width">
      <v-container
        v-if="footer"
        fluid
        class="px-0 px-md-12"
      >
        <v-row
          align="center"
          justify-md="space-between"
          justify="center"
        >
          <v-col
            cols="12"
            md="3"
            class="d-flex flex-column align-start align-md-start justify-space-between ga-3 ga-md-4 ga-lg-3"
          >
            <v-img
              :src="img(OdyswayFooterBleu, { format: 'webp', quality: 70, width: 640 })"
              :lazy-src="img(OdyswayFooterBleu, { format: 'webp', quality: 10, width: 640 })"
              :srcset="`${img(OdyswayFooterBleu, { format: 'webp', quality: 70, width: 640 })} 640w, ${img(OdyswayFooterBleu, { format: 'webp', quality: 70, width: 1024 })} 1024w`"
              sizes="(max-width: 600px) 480px, 640px"
              loading="lazy"
              alt="Logo d'Odysway"
              class="footer-logo"
            />
            <span class="text-h6 text-grey">
              {{ footer.logo.description }}
            </span>
            <div>
              <SocialsContainerButtons class="ga-4" />
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="rounded-lg px-md-0"
          >
            <v-lazy
              :options="{ threshold: 0.5 }"
              transition="fade-transition"
            >
              <v-img
                rounded="lg"
                :src="img(footer.team.image, { format: 'webp', quality: 100, width: 320, height: 270 })"
                :lazy-src="img(footer.team.image, { format: 'webp', quality: 10, width: 320, height: 270 })"
                :srcset="`${img(footer.team.image, { format: 'webp', quality: 70, width: 320, height: 270 })} 320w, ${img(footer.team.image, { format: 'webp', quality: 70, width: 640, height: 270 })} 640w`"
                sizes="(max-width: 600px) 480px, 320px"
                loading="lazy"
                alt="Image de l'équipe"
                class="bg-secondary"
              />
            </v-lazy>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex flex-column align-center justify-space-between ga-6 px-8"
          >
            <h5 class="text-h4 font-weight-bold">
              {{ footer.contact.ctaText }}
            </h5>
            <div class="d-flex flex-row flex-wrap justify-start align-start align-lg-center ga-3">
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

              class="custom-btn-width font-weight-bold align-self-center text-decoration-none text-body-1 text-capitalize"
              :to="footer.contact.buttonContact.lien"
            >
              {{ footer.contact.buttonContact.text }}
            </v-btn>
          </v-col>
        </v-row>
        <v-divider
          thickness="2"
          class="my-10 my-md-16"
        />
        <v-row class="mb-4 pb-4 text-primary">
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
          <v-divider class="my-8 d-md-none" />
          <v-col
            cols="6"
            md="3"
          >
            <h5 class="text-h4 font-weight-bold mb-10">
              {{ footer.linksList.colonne3.title }}
            </h5>
            <div class="d-flex flex-column ga-2">
              <NuxtLink
                v-for="link, index in footer.linksList.colonne3.links"
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
        <v-row align="center">
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
              v-for="policy in policies"
              :key="policy.name"
              :to="policy.link"
              variant="text"
              class="text-overline text-decoration-none"
            >
              {{ policy.name }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-footer>
</template>

<script setup>
import { useImage } from '#imports'

import OdyswayFooter from '~/assets/img/odysway-text.png'
import OdyswayFooterBleu from '~/assets/img/Logo-Odysway-Bleu.png'

const { footer } = useAppConfig()

const img = useImage()

const policies = ref([
  { name: 'FAQ',
    link: '/faq',
  },
  { name: 'Mentions légales',
    link: '/mentions-legales',
  },
  { name: 'CGV',
    link: '/conditions-generales-de-vente',
  },
  { name: 'Données personnelles',
    link: '/politique-de-confidentialite',
  },
])
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
.custom-btn-width{
  width: 360px;
}
@media screen and (max-width: 768px) {
  .footer-bg-img {
    height: 130px !important;

  }
  .footer-logo{
    width:160px;
  }
  .custom-btn-width{
  width: 100%;
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
  .footer-logo{
     width:160px;
     height: 44px;
  }

@media (max-width: 960px) {
  .footer-logo {
    width: 100px;
    height: 25px;
  }
}
</style>
