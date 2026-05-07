<template>
  <v-container
    fluid
    class="relative"
  >
    <v-img
      class="footer-bg-img absolute"
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

    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <v-card class="pa-6 pa-md-8 mt-16 checkout-full-card">
          <div class="d-flex align-start ga-4">
            <div class="icon-badge">
              <v-icon
                size="28"
                color="warning"
              >
                {{ mdiAccountGroupOutline }}
              </v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="text-overline text-medium-emphasis mb-2">
                Groupe complet
              </div>

              <h1 class="text-h5 text-md-h4 font-weight-bold mb-3">
                {{ content?.title || fallback.title }}
              </h1>

              <div
                v-if="content?.body?.length"
                class="text-body-1"
              >
                <EnrichedText :value="content.body" />
              </div>
              <p
                v-else
                class="text-body-1 mb-0"
              >
                {{ fallback.body }}
              </p>
            </div>
          </div>

          <div class="my-7 d-flex flex-wrap ga-3 justify-center">
            <v-btn
              color="primary"
              rounded
              :to="primaryCtaTo"
            >
              {{ content?.primaryCtaLabel || fallback.ctaLabel }}
            </v-btn>

            <v-btn
              variant="tonal"
              rounded
              color="secondary"
              @click="openRdv"
            >
              Prendre un rendez-vous
            </v-btn>
          </div>

          <v-btn
            variant="text"
            rounded
            block
            to="/voyages"
          >
            Voir d’autres voyages
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="rdvDialog"
      max-width="980"
      scrollable
    >
      <v-card class="pa-2 pa-md-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-h6 font-weight-bold">
            Prendre un rendez-vous
          </div>
          <v-btn
            icon
            variant="text"
            @click="rdvDialog = false"
          >
            <v-icon>
              {{ mdiClose }}
            </v-icon>
          </v-btn>
        </div>

        <CalContainer
          :travel-title="voyageSlug"
          :text="calendlyText"
          :is-funnel="false"
          funnel-type="checkout"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { mdiAccountGroupOutline, mdiClose } from '@mdi/js'
import { useImage } from '#imports'

definePageMeta({ layout: 'funnel' })
useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})

const img = useImage()
const route = useRoute()
const { trackRdvClick } = useGtmTracking()

const voyageSlug = computed(() => (route.query.voyage ? String(route.query.voyage) : ''))

const query = groq`*[_type == "pageCheckoutAlert"][0]{
  title,
  body,
  primaryCtaLabel,
  primaryCtaHref
}`

const checkoutQuery = groq`*[_type == "checkout"][0]{ calendly }`

const { data } = await useSanityQuery(query)
const content = computed(() => data.value || null)

const { data: checkoutData } = await useSanityQuery(checkoutQuery)
const calendlyText = computed(() => {
  const text = checkoutData.value?.calendly
  if (typeof text === 'string' && text.trim().length > 0) return text
  return 'Prenez un rendez-vous avec un conseiller Odysway pour trouver la meilleure option pour vos dates.'
})

const fallback = {
  title: 'Désolé, le groupe de voyageurs pour la date sélectionnée est complet',
  body: 'Cette date n’est plus disponible. Vous pouvez sélectionner une autre date ou découvrir d’autres voyages.',
  ctaLabel: 'Retour au voyage',
}

const rdvDialog = ref(false)

const openRdv = () => {
  trackRdvClick('checkout-complet')
  rdvDialog.value = true
}

const primaryCtaTo = computed(() => {
  const href = content.value?.primaryCtaHref
  if (href && typeof href === 'string' && href.trim().length > 0) return href
  if (voyageSlug.value) return `/voyages/${voyageSlug.value}`
  return '/voyages'
})
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

.checkout-full-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(6px);
}

.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-warning), 0.10);
  border: 1px solid rgba(var(--v-theme-warning), 0.25);
}
</style>
