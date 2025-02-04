<template>
  <v-footer
    class="pa-0 d-flex flex-column"
  >
    <section
      class="bg-primary test"
    >
      <v-container>
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
            <v-text-field
              variant="solo"
              flat
              bg-color="white"
              hide-details
              density="compact"
              rounded="xl"
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
    <section>
      <v-container>
        <v-row justify="center">
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
            <p class="text-center mb-4 px-6">
              Odysway est une agence de voyage certifiée Atout France et immatriculée à l'APST. Vous avez envie de voyager autrement ? Que ce soit en France ou à l'étranger, vivez un voyage en immersion unique avec une agence fiable et engagée.
            </p>
          </v-col>
          <v-col
            cols="12"
            md="3"
            class="d-flex flex-column align-center"
          >
            <h3 class="text-h5 text-uppercase text-center mb-3">
              lien utiles
            </h3>
            <v-list
              v-for="link in listUsefullLinks"
              :key="`Link to ${link.title}`"
            >
              <NuxtLink
                :to="link.link"
                class="text-primary text-center text-decoration-none"
              >
                {{ link.title }}
              </NuxtLink>
            </v-list>
          </v-col>
          <v-col
            cols="12"
            md="3"
            class="d-flex flex-column align-center"
          >
            <h3 class="text-h5 text-uppercase text-center mb-3">
              destinations
            </h3>
            <v-list
              v-for="destination in listDestinations"
              :key="`Destination to ${destination.title}`"
            >
              <NuxtLink
                :to="destination.link"
                class="text-primary text-center text-decoration-none"
              >
                {{ destination.title }}
              </NuxtLink>
            </v-list>
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <h3 class="text-h5 text-uppercase text-center mb-3">
              nous joindre
            </h3>
            <v-text-field
              variant="solo"
              flat
              readonly
              bg-color="inputBg"
              hide-details
              density="compact"
              rounded="xl"
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
              variant="solo"
              flat
              readonly
              bg-color="inputBg"
              hide-details
              density="compact"
              rounded="xl"
              label="+33 1 84 80 79 75"
              type="phone"
            >
              <template #append-inner>
                <v-icon color="black">
                  {{ mdiPhoneOutline }}
                </v-icon>
              </template>
            </v-text-field>
            <div class="d-flex justify-space-around my-4">
              <VBtnSocial
                x-small
                icon
                color="#4267B2"
                href="https://www.facebook.com/odysway/"
              >
                <v-icon>{{ mdiFacebook }}</v-icon>
              </VBtnSocial>
              <VBtnSocial
                x-small
                color="rgb(209, 32, 218)"
                href="https://www.instagram.com/odysway_travel/"
              >
                <v-icon>{{ mdiInstagram }}</v-icon>
              </VBtnSocial>
              <VBtnSocial
                x-small
                color="#ce1312"
                href="https://www.youtube.com/channel/UCsc9xUf1MF4-yDGs4ftkT2g"
              >
                <v-icon>{{ mdiYoutube }}</v-icon>
              </VBtnSocial>
              <VBtnSocial
                x-small
                color="#007ebb"
                href="https://linkedin.com/company/odysway"
              >
                <v-icon>{{ mdiLinkedin }}</v-icon>
              </VBtnSocial>
              <VBtnSocial
                x-small
                color="#E60023"
                href="https://www.pinterest.fr/odyswaytravel/"
              >
                <v-icon>{{ mdiPinterest }}</v-icon>
              </VBtnSocial>
              <VBtnSocial
                x-small
                color="#69C9D0"
                href="https://www.tiktok.com/@odyswaytravel"
              >
                <v-img
                  src="/icons/IcRoundTiktok.svg"
                  width="24px"
                  height="24px"
                  contain
                />
              </VBtnSocial>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-footer>
</template>

<script setup>
import { mdiArrowRight, mdiEmailOutline, mdiPhoneOutline, mdiFacebook, mdiInstagram, mdiYoutube, mdiLinkedin, mdiPinterest } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()

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
</script>

<style>
.test {
  width: 100%;
}
</style>
