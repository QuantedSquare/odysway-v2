<template>
  <section
    :id="id"
    class="section-porteur"
    :style="{ '--accent': couleur, '--accent-doux': `${couleur}1F` }"
  >
    <header class="section-porteur-entete d-flex align-start ga-3 mb-5">
      <div class="section-porteur-icone flex-shrink-0">
        <v-icon
          :icon="icone"
          size="22"
        />
      </div>
      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="section-porteur-numero">{{ String(numero).padStart(2, '0') }}</span>
          <h2 class="text-h5 font-weight-bold text-primary">
            {{ titre }}
          </h2>
          <v-chip
            v-if="requis && !complete"
            size="x-small"
            color="secondary"
            variant="tonal"
            class="font-weight-bold"
          >
            Requis
          </v-chip>
          <v-icon
            v-if="complete"
            :icon="mdiCheckCircle"
            color="success"
            size="20"
            aria-label="Section remplie"
          />
        </div>
        <p
          v-if="sousTitre"
          class="text-body-2 text-grey-darken-1 mt-1 mb-0"
        >
          {{ sousTitre }}
        </p>
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup>
import { mdiCheckCircle } from '@mdi/js'

// Une section du formulaire de l'Espace porteur : carte blanche, pastille
// d'icône et liseré à la couleur de la section.
defineProps({
  id: { type: String, required: true },
  numero: { type: Number, required: true },
  titre: { type: String, required: true },
  sousTitre: { type: String, default: '' },
  icone: { type: String, required: true },
  couleur: { type: String, default: '#DB6644' },
  complete: { type: Boolean, default: false },
  requis: { type: Boolean, default: false },
})
</script>

<style scoped>
.section-porteur {
  position: relative;
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(43, 76, 82, 0.06), 0 8px 24px -12px rgba(43, 76, 82, 0.18);
  overflow: hidden;
  scroll-margin-top: 120px;
}
.section-porteur::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), transparent 85%);
}
.section-porteur-icone {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-doux);
  color: var(--accent);
}
.section-porteur-numero {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
}
.min-w-0 {
  min-width: 0;
}
@media (max-width: 600px) {
  .section-porteur {
    padding: 22px 16px 18px;
    border-radius: 20px;
  }
}
</style>
