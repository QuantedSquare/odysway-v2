<template>
  <section
    id="rdv"
    class="rdv-section my-8"
  >
    <div class="rdv-left">
      <span class="kicker">{{ section.kicker }}</span>
      <h2 class="rdv-title text-primary">
        {{ section.title }}
      </h2>
      <p
        v-if="showText && section.text"
        class="rdv-text"
      >
        {{ section.text }}
      </p>
      <ul
        v-if="showBullets && section.bullets?.length"
        class="rdv-checks"
        :style="{ '--rdv-rows': Math.ceil(section.bullets.length / 2) }"
      >
        <li
          v-for="(bullet, index) in section.bullets"
          :key="index"
        >
          <v-icon
            size="18"
            color="primary"
          >
            {{ mdiCheck }}
          </v-icon>
          <span>{{ bullet }}</span>
        </li>
      </ul>
      <div
        v-if="specialistName"
        class="d-flex align-center ga-3"
      >
        <AvatarImg
          :avatar-img="section.specialist?.image"
          :name="specialistName"
          avatar-size="44"
          class="flex-shrink-0"
        />
        <div>
          <div class="text-body-2 font-weight-bold text-primary">
            {{ specialistLabel }}
          </div>
          <div class="text-caption text-primary-light-2">
            {{ section.specialistSubtitle }}
          </div>
        </div>
      </div>
    </div>

    <div class="rdv-slots">
      <h3 class="text-body-1 font-weight-bold text-primary">
        {{ section.slotsTitle }}
      </h3>
      <div class="text-caption text-primary-light-2 slots-subtitle">
        {{ section.slotsSubtitle }}
      </div>

      <div
        v-if="isLoading"
        class="slots-list"
      >
        <v-skeleton-loader
          v-for="n in slotsCount"
          :key="n"
          type="text"
          height="46"
          class="rounded-lg"
        />
      </div>
      <div
        v-else-if="visibleSlots.length"
        class="slots-list"
      >
        <button
          v-for="slot in visibleSlots"
          :key="slot.start"
          type="button"
          class="slot"
          @click="openRdv('creneau', slot.start)"
        >
          <span>{{ slot.day }}</span>
          <time :datetime="slot.start">{{ slot.time }}</time>
        </button>
      </div>
      <p
        v-else
        class="text-body-2 text-primary-light-2 mb-0"
      >
        {{ section.noSlotsText }}
      </p>

      <div class="slots-foot">
        <v-btn-secondary
          height="48"
          rounded="md"
          class="text-body-2 font-weight-bold text-decoration-none see-all"
          @click="openRdv('bloc_rdv')"
        >
          {{ section.seeAllSlotsText }}
        </v-btn-secondary>
        <div class="text-caption text-primary-light-2">
          {{ section.slotsFooter }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { mdiCheck } from '@mdi/js'
import { stegaClean } from '@sanity/client/stega'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  calLink: {
    type: String,
    required: true,
  },
})

const { openRdv } = useRdvBooking()

const displayMode = computed(() => stegaClean(props.section.displayMode) || 'both')
const showText = computed(() => displayMode.value !== 'bullets')
const showBullets = computed(() => displayMode.value !== 'text')

// « Lucie, <titre> » : la référence teamMember apporte photo et nom,
// sinon specialistName (défaut du code ou Sanity). Le titre du bloc prime sur le poste.
const specialistName = computed(() => props.section.specialist?.name || props.section.specialistName)
const specialistLabel = computed(() => {
  const title = props.section.specialistTitle || props.section.specialist?.position
  return title ? `${specialistName.value}, ${title}` : specialistName.value
})
const slotsCount = computed(() => Math.max(0, Number(stegaClean(props.section.slotsCount)) || 0))

const slots = ref([])
const isLoading = ref(true)

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })

const visibleSlots = computed(() => slots.value.slice(0, slotsCount.value).map((start) => {
  const date = new Date(start)
  const day = dayFormatter.format(date)
  return {
    start,
    day: day.charAt(0).toUpperCase() + day.slice(1),
    time: timeFormatter.format(date).replace(':', ' h '),
  }
}))

// Créneaux chargés côté client : la page reste en cache ISR, les disponibilités
// sont fraîches (cache serveur de 5 min).
onMounted(async () => {
  if (!slotsCount.value) {
    isLoading.value = false
    return
  }
  try {
    const res = await $fetch('/api/v1/cal/slots', { query: { calLink: stegaClean(props.calLink) } })
    slots.value = res?.slots || []
  }
  catch (error) {
    console.error('Cal.com slots:', error)
  }
  finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.rdv-section {
  scroll-margin-top: 100px;
  background: #EDF2F3;
  border: 1px solid #D7E1E3;
  border-radius: 18px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.rdv-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  container-type: inline-size;
  container-name: rdv-left;
}
.kicker {
  font-size: 11px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgb(var(--v-theme-secondary));
}
.rdv-title {
  font-size: 1.6rem;
  line-height: 1.2;
}
.rdv-text {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(43, 76, 82, 0.85);
  margin: 0;
  max-width: 58ch;
}
.rdv-checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
/* 2 colonnes de 3 (remplissage colonne par colonne) dès que la colonne de texte
   est assez large ; en dessous, une seule colonne plutôt que des puces écrasées. */
@container rdv-left (min-width: 380px) {
  .rdv-checks {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(var(--rdv-rows, 3), auto);
    grid-auto-flow: column;
    gap: 10px 20px;
  }
}
.rdv-checks li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(43, 76, 82, 0.9);
}
.rdv-checks li :deep(.v-icon) {
  margin-top: 2px;
  flex: none;
}
.rdv-slots {
  background: #fff;
  border: 1px solid #DFE4E3;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.slots-subtitle {
  margin-top: -6px;
}
.slots-list {
  display: grid;
  gap: 10px;
}
.slots-foot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}
.see-all {
  width: 100%;
}
.slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid #CBD7D9;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.slot:hover,
.slot:focus-visible {
  border-color: rgb(var(--v-theme-primary));
  background: #EDF2F3;
}
.slot span,
.slot time {
  white-space: nowrap;
}
.slot time {
  font-variant-numeric: tabular-nums;
  flex: none;
}
/* Maquette : texte, puces et signature à gauche ; créneaux à droite. */
@media (min-width: 960px) {
  .rdv-section {
    flex-direction: row;
    align-items: flex-start;
    gap: 30px;
    padding: 30px;
  }
  .rdv-left {
    flex: 1 1 auto;
  }
  .rdv-slots {
    flex: 0 0 300px;
  }
  .slot {
    font-size: 0.85rem;
  }
  .rdv-title {
    font-size: 1.85rem;
  }
}
</style>
