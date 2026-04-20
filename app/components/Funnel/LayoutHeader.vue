<template>
  <v-app-bar
    elevation="0"
    color="white"
    :height="60"
  >
    <ClientOnly>
      <v-container
        fluid
        class="d-flex align-center h-100 px-4 px-md-6 justify-space-between"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="pt-2"
        >
          <NuxtImg
            src="/logos/Logo-Odysway-Bleu.png"
            :height="25"
            alt="Odysway"
            format="webp"
          />
        </NuxtLink>

        <!-- Contact (right) -->
        <div class="d-flex ga-6">
          <a
            href="tel:+33184807975"
            class="text-decoration-none d-flex flex-column align-end justify-center "
            @click="trackCallClick('funnel-header')"
          >

            <!-- <span class="text-caption text-medium-emphasis">Besoin d'aide ?</span> -->
            <span class="text-subtitle-2 text-primary d-flex align-center">
              <v-icon
                start
                size="20"
              >
                {{ mdiPhone }}
              </v-icon>
              <span class="d-none d-md-block">
                +33 1 84 80 79 75
              </span>
              <span class="d-block d-md-none">
                Nous appeler
              </span>
            </span>
          </a>
          <v-btn-secondary
            height="40"
            rounded="md"
            class="d-none d-md-block"
          >
            <span>
              Prendre RDV 👋
            </span>
          </v-btn-secondary>
        </div>
      </v-container>
    </ClientOnly>
  </v-app-bar>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiPhone } from '@mdi/js'

const { mdAndUp } = useDisplay()
const { travelTitle } = useFunnelHeader()
const { trackCallClick } = useGtmTracking()
</script>
