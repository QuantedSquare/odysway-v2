<template>
  <v-container class="devis-form">
    <div class="section-header mb-4">
      <span class="section-bar" />
      <span class="text-overline font-weight-bold text-primary">VOS COORDONNÉES</span>
    </div>
    <v-form>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Prénom
          </div>
          <v-text-field
            v-model="model.firstname"
            placeholder="Prénom"
            :rules="[rules.name]"
            hide-details
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Nom
          </div>
          <v-text-field
            v-model="model.lastname"
            placeholder="Nom"
            :rules="[rules.name]"
            hide-details
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Email
          </div>
          <v-text-field
            v-model="model.email"
            placeholder="votre@email.com"
            :rules="[rules.email]"
            hide-details
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Téléphone
          </div>
          <PhoneTextField
            v-model="model.phone"
            @validity-changed="model.validatePhone = $event"
          />
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="section-header mb-4">
        <span class="section-bar" />
        <span class="text-overline font-weight-bold text-primary">VOTRE PROJET</span>
      </div>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Mois de départ
          </div>
          <v-select
            v-model="model.departureMonth"
            placeholder="Mois..."
            :items="monthItems"
            item-title="label"
            item-value="value"
            hide-details
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Année
          </div>
          <v-select
            v-model="model.departureYear"
            :items="yearItems"
            hide-details
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Nombre de voyageurs
          </div>
          <v-select
            v-model="model.nbTravelers"
            :items="travelerItems"
            item-title="label"
            item-value="value"
            hide-details
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div class="text-caption mb-1">
            Vol souhaité ?
          </div>
          <v-btn-toggle
            v-model="model.includeFlight"
            mandatory

            variant="outlined"
            class="w-100 flight-toggle ga-4"
          >
            <v-btn
              :value="true"
              color="success"
              class="flex-grow-1 border-sm"
              variant="text"
            >
              Oui
            </v-btn>
            <v-btn
              :value="false"
              variant="text"
              color="success"
              class="flex-grow-1 border-sm"
            >
              Non
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12">
          <div class="text-caption mb-1">
            Ville de départ
          </div>
          <v-text-field
            v-model="model.departureCity"
            placeholder="ex. Paris, Lyon, Bordeaux..."
            hide-details
          />
        </v-col>
        <v-col cols="12">
          <div class="text-caption mb-1">
            Votre message <span class="text-medium-emphasis">(optionnel)</span>
          </div>
          <v-textarea
            v-model="model.message"
            placeholder="Dites-nous en plus sur votre projet : vos envies, vos contraintes, votre niveau de pratique..."
            rows="3"
            hide-details
            flat
            variant="solo"
            rounded="md"
            bg-color="surface-panel"
          />
        </v-col>
      </v-row>

      <div class="text-caption text-medium-emphasis mt-2 mb-4">
        En envoyant ce formulaire, vous acceptez notre
        <NuxtLink
          to="/politique-de-confidentialite"
          class="text-primary"
        >
          politique de confidentialité
        </NuxtLink>. Vos données ne sont jamais revendues.
      </div>

      <v-btn
        block
        height="56"
        color="secondary"
        :append-icon="mdiArrowRight"
        :disabled="!isValid"
        :loading="model.loading"
        class="text-body-1 font-weight-bold"
        @click="emit('submit')"
      >
        Envoyer ma demande
      </v-btn>
      <div class="text-center text-caption text-medium-emphasis mt-2">
        🔒 Sans engagement · Devis gratuit
      </div>
    </v-form>
  </v-container>
</template>

<script setup>
import { z } from 'zod'
import { mdiArrowRight } from '@mdi/js'

defineProps({
  page: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit'])
const model = defineModel({ required: true })

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
}

const monthItems = [
  { label: 'Janvier', value: 1 },
  { label: 'Février', value: 2 },
  { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 },
  { label: 'Août', value: 8 },
  { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 },
  { label: 'Novembre', value: 11 },
  { label: 'Décembre', value: 12 },
]

const yearItems = computed(() => {
  const start = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => start + i)
})

const travelerItems = computed(() =>
  Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} voyageur${i + 1 > 1 ? 's' : ''}`,
  })),
)

const isValid = computed(() => {
  return !!model.value.firstname
    && !!model.value.lastname
    && emailSchema.safeParse(model.value.email).success
    && model.value.validatePhone === true
    && +model.value.nbTravelers >= 1
    && !!model.value.departureMonth
    && !!model.value.departureYear
})
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-bar {
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: rgb(var(--v-theme-secondary));
  border-radius: 2px;
}

:deep(.v-field-label) {
  font-weight: regular !important;

}
:deep(.v-field-label) {
  font-weight: regular !important;
  color: rgb(118, 118, 118, 0.6) !important;
}
</style>
