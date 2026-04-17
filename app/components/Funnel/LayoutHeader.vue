<template>
  <v-app-bar
    elevation="0"
    color="white"
    :height="mdAndUp ? 90 : 60"
  >
    <ClientOnly>
      <v-container
        fluid
        class="d-flex align-center h-100 px-4 px-md-6 justify-space-between"
      >
        <!-- Logo -->
        <NuxtLink to="/">
          <NuxtImg
            src="/logos/Logo-Odysway-Bleu.png"
            :height="mdAndUp ? 30 : 25"
            alt="Odysway"
            format="webp"
          />
        </NuxtLink>

        <!-- Travel title (center)
        <div class=" text-center px-4 text-truncate d-none d-sm-flex">
          <span
            v-if="travelTitle"
            class="font-weight-bold text-body-2 text-md-body-1 text-primary"
          >
            {{ travelTitle }}
          </span>
        </div> -->

        <!-- Contact (right) -->
        <div class="d-flex ga-6">
          <a
            href="tel:+33184807975"
            class="text-decoration-none d-flex flex-column align-end justify-center "
            @click="trackCallClick('funnel-header')"
          >

            <!-- <span class="text-caption text-medium-emphasis">Besoin d'aide ?</span> -->
            <span class="text-subtitle-2 text-primary">
              <v-icon
                start
                size="15"
              >
                {{ mdiPhone }}
              </v-icon>
              +33 1 84 80 79 75</span>
          </a>
          <v-btn-secondary
            height="40"
            rounded="md"
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
