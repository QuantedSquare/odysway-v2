<template>
  <v-container>
    <v-tabs
      v-model="tab"
      grow
      color="white"
      :next-icon="mdiChevronRight"
      align-tabs="center"
      show-arrows
      hide-slider
      selected-class="active"
    >
      <template #prev="{ prev }">
        <v-btn
          :icon="mdiChevronLeft"
          class="bg-white"
          size="small"
          @click="prev"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
      </template>
      <template #next="{ next }">
        <v-btn
          :icon="mdiChevronRight"
          class="bg-white"
          size="small"
          @click="next"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
      </template>
      <v-tab
        :value="1"
        class="rounded-t-lg"
      >
        <div class="text-subtitle-1 text-md-h6 font-weight-bold">
          <slot
            name="phrase-left-title"
            mdc-unwrap="p"
          />
          <p class="text-caption">
            <slot
              name="phrase-left-subtitle"
              mdc-unwrap="p"
            />
          </p>
        </div>
      </v-tab>
      <v-tab
        v-if="deal.privatisation"
        :value="2"
        class="rounded-t-lg"
      >
        <div class="text-subtitle-1 text-md-h6 font-weight-bold">
          <slot
            name="phrase-right-title"
            mdc-unwrap="p"
          />
          <p
            class="text-caption"
          >
            <slot
              name="phrase-right-subtitle"
              mdc-unwrap="p"
            />
          </p>
        </div>
      </v-tab>
    </v-tabs>

    <v-tabs-window
      v-model="tab"
      class="bg-primary"
    >
      <v-tabs-window-item :value="1">
        <v-table class="bg-primary">
          <thead>
            <tr>
              <th class="text-center text-uppercase">
                date départ
              </th>
              <th class="text-center text-uppercase">
                date retour
              </th>
              <th class="text-center text-uppercase">
                prix
              </th>
              <th class="text-center text-uppercase">
                état
              </th>
              <th class="text-center text-uppercase">
                réserver
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in dates"
              :key="item"
              class="text-center"
            >
              <td>{{ dayjs(item.departureDate, 'DD/MM/YYYY').format('ddd DD/MM/YYYY') }}</td>
              <td>{{ item.returnDate }}</td>
              <td>{{ item.startingPrice }} €</td>
              <td>
                <div v-if="item.bookedPlaces < 2">
                  <v-icon>
                    {{ mdiAccount }}
                  </v-icon> Confirmé dès 2 inscrits
                </div>
                <div v-else>
                  <v-icon>
                    {{ mdiCheckCircleOutline }}
                  </v-icon> <span>Départ garanti</span>
                  <p>Confirmé</p>
                  <v-icon>{{ mdiAccount }}</v-icon> {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places
                </div>
              </td>
              <td>
                <div v-if="item.maxTravellers !== item.bookedPlaces">
                  <v-btn-secondary
                    :to="`/checkout?slug=${deal.slug}&departure_date=${dayjs(item.departureDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}&return_date=${dayjs(item.returnDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}`"
                    class="text-caption text-uppercase"
                  >
                    réserver / poser une option
                  </v-btn-secondary>
                </div>
                <div v-else>
                  plus de places disponibles
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-tabs-window-item>
      <v-tabs-window-item
        v-show="deal.privatisation"
        :value="2"
      >
        <PrivateTabContainer :deal="deal" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight, mdiAccount, mdiCheckCircleOutline } from '@mdi/js'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const tab = ref(null)

const route = useRoute()

const { data: deal } = await useAsyncData(route.params.voyageSlug, () => {
  return queryCollection('deals').where('slug', '=', props.slug).first()
})
const dates = computed(() => {
  return deal.value?.dates
})
</script>

<style scoped>
.active {
background-color: #2e8b57;
}
</style>
