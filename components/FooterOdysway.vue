<template>
  <v-footer class="position-relative d-flex justify-center mt-md-10 ">
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
    <div class="mx-md-5 ">
      <v-container
        v-if="footer"
        fluid
        class="px-0 mx-0 mx-md-5 max-container-width"
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
              :alt="footer.logo.description"
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
              <SanityImage
                v-if="footer.team.image?.asset"
                :asset-id="footer.team.image.asset._ref"
                auto="format"
              >
                <template #default="{ src }">
                  <v-img
                    rounded="lg"
                    :src="src"
                    :lazy-src="img(src, { format: 'webp', quality: 10, width: 320, height: 270 })"
                    loading="lazy"
                    alt="Image de l'équipe"
                    class="max-height-300"
                  />
                </template>
              </SanityImage>
            </v-lazy>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex flex-column align-md-center justify-space-between ga-6 px-3 px-md-8"
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
            v-if="footer.linksList.colonne1.links.length > 0"
            cols="6"
            md="3"
          >
            <h5 class="text-h4 font-weight-bold mb-10">
              {{ footer.linksList.colonne1.title }}
            </h5>
            <div
              class="d-flex flex-column ga-2"
            >
              <template
                v-for="(link, index) in footer.linksList.colonne1.links"
                :key="link.text + index"
              >
                <SmartLink :to="link.to">
                  {{ link.text }}
                </SmartLink>
              </template>
            </div>
          </v-col>
          <v-col
            v-if="footer.linksList.colonne2.links.length > 0"
            cols="6"
            md="3"
          >
            <h5 class="text-h4 font-weight-bold mb-10">
              {{ footer.linksList.colonne2.title }}
            </h5>
            <div
              class="d-flex flex-column ga-2"
            >
              <template
                v-for="(link, index) in footer.linksList.colonne2.links"
                :key="link.text + index"
              >
                <SmartLink :to="link.to">
                  {{ link.text }}
                </SmartLink>
              </template>
            </div>
          </v-col>
          <v-col
            v-if="footer.linksList.colonne3.links.length > 0"
            cols="6"
            md="3"
          >
            <h5 class="text-h4 font-weight-bold mb-10">
              {{ footer.linksList.colonne3.title }}
            </h5>
            <div

              class="d-flex flex-column ga-2"
            >
              <template
                v-for="(link, index) in footer.linksList.colonne3.links"
                :key="link.text + index"
              >
                <SmartLink :to="link.to">
                  {{ link.text }}
                </SmartLink>
              </template>
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
        <v-row
          align="center"
          :class="isVoyageDetailPage ? 'pb-16 pb-md-0' : 'mb-0'"
        >
          <v-col
            cols="12"
            md="auto"
            class="d-flex justify-center justify-md-start text-grey py-0"
          >
            <span class="text-center text-md-left">© Copyright 2025 - Tous droits réservés à Odysway</span>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="5"
            class="text-center text-md-right d-flex justify-space-between"
          >
            <template
              v-for="policy in policies"
              :key="policy.name"
            >
              <SmartLink :to="policy.link">
                {{ policy.name }}
              </SmartLink>
            </template>
          </v-col>
          <v-spacer />
        </v-row>
      </v-container>
    </div>
  </v-footer>
</template>

<script setup>
import { useImage } from '#imports'
import OdyswayFooter from '~/assets/img/odysway-text.png'
import OdyswayFooterBleu from '~/assets/img/Logo-Odysway-Bleu.png'

const route = useRoute()
const sanity = useSanity()

const footerQuery = groq`*[_type == "footer"][0]{
  logo {
    description
  },
  team {
    image {
      asset {
        _ref
      }
    }
  },
  contact,
  social,
  linksList
}`

const { data: footer } = await useAsyncData('footer', () =>
  sanity.fetch(footerQuery)
)

const img = useImage()

// Add computed property to check if current route is a voyage detail page
const isVoyageDetailPage = computed(() => {
  return /^\/voyages\/[^/]+$/.test(route.path)
})

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
.max-height-300{
  max-height: 300px;
}
</style>
