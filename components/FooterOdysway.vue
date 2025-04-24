<template>
  <v-footer class="bg-cover-odysway">
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
          class="d-flex flex-column align-start justify-space-between ga-6"
        >
          <v-img
            :src="img(footer.logo.image, { format: 'webp', quality: 70, width: 640 })"
            width="200"
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
            :src="img(footer.team.image, { format: 'webp', quality: 70, width: 320, height: 270 })"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column align-start justify-space-between ga-6"
        >
          <h5 class="text-h4 font-weight-bold">
            {{ footer.contact.ctaText }}
          </h5>
          <div class="d-flex justify-start align-center ga-4 ">
            <v-chip
              :text="footer.contact.phone"
              color="primary"
              class="font-weight-bold"
            />
            <v-chip
              :text="footer.contact.email"
              color="primary"
              class="font-weight-bold"
            />
          </div>
          <v-btn

            color="secondary"
            height="62"
            width="360"
            class="font-weight-bold"
            :to="footer.contact.buttonContact.link"
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

const { width } = useDisplay()
const { footer } = useAppConfig()
console.log('footer', footer)

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
.bg-cover-odysway {
  background-image: url('/logos/odysway-text.png');
  background-size: 100% 400px;
    background-position: center;
  background-repeat: no-repeat;
}
@media screen and (max-width: 768px) {
  .bg-cover-odysway {
    background-size: 100% 130px;
    background-image: url('/logos/odysway-text.png');
  }
}
</style>
