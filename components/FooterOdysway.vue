<template>
  <v-footer
    class="pa-0 d-flex flex-column bg-odysway-2"
  >
    <section
      id="newsletter"
      class="bg-primary section-width"
    >
      <v-container>
        <v-row
          justify="center"
          align-md="center"
          class="py-4"
        >
          <v-col
            cols="12"
            md="8"
          >
            <h5 class="text-h5 text-center text-md-left ">
              2 fois par mois, nos inspirations et idées pour voyager autrement 🌍
            </h5>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <v-text-field
              id="newsletter"
              v-model="email"
              variant="solo"
              outlined
              flat
              hide-details
              density="compact"
              bg-color="white"
              placeholder="Votre adresse email"
              type="email"
            >
              <template #append-inner>
                <v-icon color="grey">
                  {{ mdiArrowRight }}
                </v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </section>
    <section
      id="sitemap"
      class="section-width"
    >
      <v-container>
        <v-row
          class="text-dark text-center text-md-left"
        >
          <v-col
            cols="12"
            md="3"
            class="d-flex flex-column align-center"
          >
            <v-img
              contain
              width="100%"
              max-height="42px"
              class="my-2"
              :src="img('/logos/logo_noir.png', { format: 'webp', quality: 70, width: 640 })"
            />
            <p class="mb-3">
              {{ pOdysway }}
            </p>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="auto"

            class="d-flex flex-column align-center align-md-start"
          >
            <h3 class="text-uppercase text-h6 text-md-overline font-weight-bold mb-3 mb-md-0">
              lien utiles
            </h3>
            <LinksList :list="listUsefullLinks" />
          </v-col>
          <v-spacer />

          <v-col
            cols="12"
            md="auto"
          >
            <h3 class="text-uppercase text-h6 text-md-overline font-weight-bold mb-3 mb-md-0">
              destinations
            </h3>
            <LinksList :list="listDestinations" />
          </v-col>
          <v-spacer />

          <v-col
            cols="12"
            md="4"
          >
            <h3 class="text-uppercase text-h6 text-md-overline font-weight-bold mb-3 mb-md-0">
              nous joindre
            </h3>
            <v-text-field
              id="email"
              variant="solo"
              outlined
              flat
              hide-details
              density="compact"
              readonly
              bg-color="odysway-1"
              label="contact@odysway.com"
              type="email"
              class="mb-3"
            >
              <template #append-inner>
                <v-icon color="black">
                  {{ mdiEmailOutline }}
                </v-icon>
              </template>
            </v-text-field>
            <v-text-field
              id="phone"
              variant="solo"
              outlined
              flat
              hide-details
              density="compact"
              readonly
              bg-color="odysway-1"
              label="+33 1 84 80 79 75"
              type="tel"
              class="mb-3"
            >
              <template #append-inner>
                <v-icon color="black">
                  {{ mdiPhoneOutline }}
                </v-icon>
              </template>
            </v-text-field>
            <SocialsContainerButtons />
          </v-col>
        </v-row>
      </v-container>
    </section>
    <section
      id="policies"
      class="section-width"
    >
      <v-container>
        <v-divider />
        <v-row align="center">
          <v-col
            cols="12"
            md="5"
            class="d-flex justify-center"
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
        </v-row>
      </v-container>
    </section>
  </v-footer>
</template>

<script setup>
import { mdiArrowRight, mdiEmailOutline, mdiPhoneOutline } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()
const email = ref('')

const pOdysway = ref ('Odysway est une agence de voyage certifiée Atout France et immatriculée à l\'APST. Vous avez envie de voyager autrement ? Que ce soit en France ou à l\'étranger, vivez un voyage en immersion unique avec une agence fiable et engagée.')

const listUsefullLinks = ref([
  { title: 'Nos voyages',
    link: '/thematiques',
  },
  { title: 'Acheter une carte cadeau',
    // link: '/offre-cadeau',
  },
  { title: 'Blog',
    // link: '/blog',
  },
  { title: 'Catégories',
    link: '/thematiques?category=Grands%20espaces',
  },
  { title: 'Concept',
    link: '/concept',
  },
  { title: 'Avis',
    // link: '/avis-voyageurs',
  },
  { title: 'Nous recrutons',
    // link: '/nous-recrutons',
  },
  { title: 'Voyage sur-mesure',
    // link: '/sur-mesure',
  },
  { title: 'Séminaires & Voyages pour entreprises',
    // link: '/entreprise',
  },
  { title: 'Séjours pour les groupes (écoles, clubs, associations...)',
    // link: '/https://tally.so/r/n9QLo5',
  },
])

const listDestinations = ref([
  { title: 'Afrique',
    link: '/destinations/afrique',
  },
  { title: 'Amérique Centrale',
    link: '/destinations/amerique-centrale',
  },
  { title: 'Amérique du Nord',
    link: '/destinations/amerique-du-nord',
  },
  { title: 'Amérique du Sud',
    link: '/destinations/amerique-du-sud',
  },
  { title: 'Asie',
    link: '/destinations/asie',
  },
  { title: 'Europe',
    link: '/destinations/europe',
  },
  { title: 'France',
    link: '/destinations/france',
  },
])

const policies = ref([
  { name: 'FAQ',
    // link: '/faq',
  },
  { name: 'Mentions légales',
    // link: '/mentions-legales',
  },
  { name: 'CGV',
    // link: '/conditions-generales-de-vente',
  },
  { name: 'Données personnelles',
    // link: '/politique-de-confidentialite',
  },
])
</script>

<style>
.section-width {
  width: 100%;
}
</style>
