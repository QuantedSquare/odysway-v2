<template>
  <v-footer
    class="pa-0 d-flex flex-column"
  >
    <section
      id="newsletter"
      class="bg-primary section-width"
    >
      <v-container fluid>
        <v-row
          justify="center"
          align-md="center"
        >
          <v-col
            cols="12"
            md="8"
          >
            <h5 class="text-h5 text-center">
              2 fois par mois, nos inspirations et idées pour voyager autrement 🌍
            </h5>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <VTextFieldHome
              bg-color="white"
              placeholder="Votre adresse email"
              type="email"
            >
              <template #append-inner>
                <v-icon color="grey">
                  {{ mdiArrowRight }}
                </v-icon>
              </template>
            </VTextFieldHome>
          </v-col>
        </v-row>
      </v-container>
    </section>
    <section
      id="sitemap"
      class="section-width"
    >
      <v-container fluid>
        <v-row justify="space-between">
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
              :src="img('/logos/logo_noir_original.png', { format: 'webp', quality: 70 })"
            />
            <p class="text-center text-md-left mb-3">
              {{ pOdysway }}
            </p>
          </v-col>
          <v-col
            cols="12"
            md="3"
            class="d-flex flex-column align-center align-md-start"
          >
            <h3 class="text-uppercase text-h6 text-center text-md-left mb-3 mb-md-0">
              lien utiles
            </h3>
            <LinksList :list="listUsefullLinks" />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <h3 class="text-uppercase text-h6 text-center text-md-left mb-3 mb-md-0">
              destinations
            </h3>
            <LinksList :list="listDestinations" />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <h3 class="text-uppercase text-h6 text-center text-md-left mb-3 mb-md-0">
              nous joindre
            </h3>
            <VTextFieldHome
              readonly
              bg-color="inputBg"
              label="contact@odysway.com"
              type="email"
              class="mb-3"
            >
              <template #append-inner>
                <v-icon color="black">
                  {{ mdiEmailOutline }}
                </v-icon>
              </template>
            </VTextFieldHome>
            <VTextFieldHome
              readonly
              bg-color="inputBg"
              label="+33 1 84 80 79 75"
              type="phone"
            >
              <template #append-inner>
                <v-icon color="black">
                  {{ mdiPhoneOutline }}
                </v-icon>
              </template>
            </VTextFieldHome>
            <SocialContainerButtons />
          </v-col>
        </v-row>
      </v-container>
    </section>
    <v-divider
      role="presentation"
      width="100%"
    />
    <section
      id="policies"
      class="section-width"
    >
      <v-container fluid>
        <v-row>
          <v-col
            cols="12"
            md="5"
            class="d-flex justify-center"
          >
            <span class="text-center">© Copyright 2025 - Tous droits réservés à Odysway</span>
          </v-col>
          <v-col
            cols="12"
            md="7"
            class="d-inline"
          >
            <v-btn
              variant="text"
            >
              <v-img
                :src="img('/icons/gb.svg', { format: 'webp', quality: 70 })"
                height="20px"
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

const pOdysway = ref ('Odysway est une agence de voyage certifiée Atout France et immatriculée à l\'APST. Vous avez envie de voyager autrement ? Que ce soit en France ou à l\'étranger, vivez un voyage en immersion unique avec une agence fiable et engagée.')

const listUsefullLinks = ref([
  { title: 'Nos oyages',
    link: '/thematiques',
  },
  { title: 'Acheter une carte cadeau',
    link: '/offre-cadeau',
  },
  { title: 'Blog',
    link: '/blog',
  },
  { title: 'Catégories',
    link: '/thematiques?category=Grands%20espaces',
  },
  { title: 'Concept',
    link: '/concept',
  },
  { title: 'Avis',
    link: '/avis-voyageurs',
  },
  { title: 'Nous recrutons',
    link: '/nous-recrutons',
  },
  { title: 'Voyage sur-mesure',
    link: '/sur-mesure',
  },
  { title: 'Séminaires & Voyages pour entreprises',
    link: '/entreprise',
  },
  { title: 'Séjours pour les groupes (écoles, clubs, associations...)',
    link: '/https://tally.so/r/n9QLo5',
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
  { name: 'FAQ', link: '/faq' },
  { name: 'Mentions légales', link: '/mentions-legales' },
  { name: 'CGV', link: '/conditions-generales-de-vente' },
  { name: 'Données personnelles', link: '/politique-de-confidentialite' },
])
</script>

<style>
.section-width {
  width: 100%;
}
</style>
