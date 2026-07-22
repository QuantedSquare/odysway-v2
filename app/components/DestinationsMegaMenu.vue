<template>
  <v-menu
    v-model="open"
    location="bottom"
    offset="10"
    :close-on-content-click="true"
    transition="fade-transition"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="dest-trigger"
        :class="{ 'dest-trigger--transparent': isTransparent, 'dest-trigger--open': open }"
        :aria-expanded="open"
        v-bind="menuProps"
      >
        Destinations
        <v-icon
          class="dest-trigger__chevron"
          size="18"
        >
          {{ mdiChevronDown }}
        </v-icon>
      </button>
    </template>

    <v-card
      class="dest-mega"
      elevation="8"
      rounded="lg"
    >
      <div class="dest-mega__cols">
        <div
          v-for="zone in zones"
          :key="zone.id"
          class="dest-mega__col"
        >
          <h3>
            <v-icon size="15">
              {{ mdiMapMarkerOutline }}
            </v-icon>
            {{ zone.name }}
          </h3>
          <NuxtLink
            v-for="destination in zone.destinations.slice(0, 6)"
            :key="destination._id"
            :to="`/destinations/${destination.slug}`"
          >
            {{ destination.title }}
          </NuxtLink>
          <NuxtLink
            class="dest-mega__all"
            :to="`/destinations/${zone.slug}`"
          >
            Voir tout {{ zone.name }} →
          </NuxtLink>
        </div>
      </div>
      <div class="dest-mega__foot">
        <p>Pas encore d'idée ? <b>Parcourez tous les voyages</b> et filtrez par envie.</p>
        <v-btn
          color="secondary"
          rounded="pill"
          class="dest-mega__cta text-none"
          to="/voyages"
        >
          Tous nos voyages
          <v-icon
            end
            size="18"
          >
            {{ mdiArrowRight }}
          </v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
import { mdiArrowRight, mdiChevronDown, mdiMapMarkerOutline } from '@mdi/js'

defineProps({
  isTransparent: {
    type: Boolean,
    default: false,
  },
})

const open = ref(false)
const { zones } = useDestinationsMenu()
</script>

<style scoped>
.dest-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 0 8px;
  font-family: inherit;
  font-size: 18px;
  font-weight: 500;
  color: rgb(43, 76, 82);
  cursor: pointer;
  white-space: nowrap;
}
.dest-trigger__chevron {
  color: rgb(43, 76, 82);
  transition: transform 0.2s ease;
}
.dest-trigger--open .dest-trigger__chevron {
  transform: rotate(180deg);
}
.dest-trigger--transparent {
  color: #fbf0ec;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
.dest-trigger--transparent .dest-trigger__chevron {
  color: #fbf0ec;
}

.dest-mega {
  max-width: 940px;
  padding: 22px 24px 16px;
}
.dest-mega__cols {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 20px;
}
.dest-mega__col h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #de5e2c;
}
.dest-mega__col h3 :deep(.v-icon) {
  color: inherit;
}
.dest-mega__col a {
  display: block;
  padding: 5px 0;
  font-size: 14px;
  color: #333;
  text-decoration: none;
}
.dest-mega__col a:hover {
  color: #2b4c52;
}
.dest-mega__all {
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #2b4c52 !important;
}
.dest-mega__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(43, 76, 82, 0.13);
}
.dest-mega__foot p {
  margin: 0;
  font-size: 13.5px;
  color: #5d6566;
}
.dest-mega__cta {
  margin-left: auto;
}
</style>
