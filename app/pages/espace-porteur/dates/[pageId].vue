<template>
  <div class="dates-porteur">
    <header class="dates-barre d-flex align-center ga-2 ga-sm-3 px-2 px-sm-4 py-2">
      <v-btn
        :to="`/espace-porteur/${pageId}`"
        variant="text"
        size="small"
        :prepend-icon="mdiArrowLeft"
      >
        Ma page
      </v-btn>
      <span class="dates-marque d-none d-sm-inline">odysway<span class="text-secondary">.</span></span>
      <v-spacer />
      <v-btn
        to="/espace-porteur"
        variant="text"
        size="small"
      >
        Mes pages
      </v-btn>
    </header>

    <div class="dates-fond px-4 py-6">
      <div class="dates-contenu">
        <div
          v-if="chargement"
          class="d-flex justify-center py-16"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <v-alert
          v-else-if="erreur && !vue"
          type="warning"
          variant="tonal"
        >
          {{ erreur }}
        </v-alert>

        <v-defaults-provider
          v-else
          :defaults="CHAMPS"
        >
          <div class="dates-bandeau mb-5">
            <p class="dates-bandeau-sur text-caption font-weight-bold text-uppercase mb-2">
              Dates et inscriptions
            </p>
            <h1 class="text-h4 font-weight-bold mb-2">
              {{ vue.titre || 'Votre séjour' }}
            </h1>
            <p class="text-body-2 mb-0 dates-bandeau-texte">
              Proposez vos dates : l'équipe Odysway les valide, fixe avec vous le prix et les ouvre aux inscriptions sur votre page. Suivez ici le remplissage de chaque départ.
            </p>
          </div>

          <!-- Départs -->
          <EspacePorteurSection
            id="section-departs"
            :numero="1"
            titre="Vos départs"
            sous-titre="Les dates ouvertes par Odysway sur votre page, et où en sont les inscriptions."
            :icone="mdiCalendarCheckOutline"
            couleur="#237C8C"
            :complete="vue.aVenir.length > 0"
          >
            <p
              v-if="!vue.enLigne"
              class="text-body-2 text-grey-darken-1 mb-0"
            >
              Vos départs apparaîtront ici une fois votre page en ligne. Vous pouvez déjà proposer vos dates.
            </p>
            <p
              v-else-if="!vue.aVenir.length"
              class="text-body-2 text-grey-darken-1 mb-0"
            >
              Aucun départ à venir pour l'instant. Proposez une date ci-dessous.
            </p>
            <div
              v-for="d in vue.aVenir"
              :key="d.id"
              class="depart mb-3"
              data-test="depart"
            >
              <div class="d-flex align-center flex-wrap ga-2 mb-3">
                <span class="text-subtitle-1 font-weight-bold text-primary">{{ periode(d.depart, d.retour) }}</span>
                <v-spacer />
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="COULEURS_DEPART[d.statut]"
                >
                  {{ portageDates.STATUTS_DEPART[d.statut] }}
                </v-chip>
              </div>

              <div
                class="jauge mb-2"
                role="img"
                :aria-label="`${d.placesReservees} places réservées${d.max ? ` sur ${d.max}` : ''}, dont ${d.placesPayees} payées`"
              >
                <div
                  class="jauge-payees"
                  :style="{ width: `${pourcent(d.placesPayees, d)}%` }"
                />
                <div
                  class="jauge-options"
                  :style="{ width: `${pourcent(Math.max(0, d.placesReservees - d.placesPayees), d)}%` }"
                />
                <div
                  v-if="d.min && d.max"
                  class="jauge-seuil"
                  :style="{ left: `${pourcent(d.min, d)}%` }"
                />
              </div>
              <div class="d-flex flex-wrap ga-x-4 ga-y-1 text-body-2 mb-2">
                <span><b>{{ d.placesReservees }}</b>{{ d.max ? ` / ${d.max}` : '' }} places réservées</span>
                <span class="legende legende-payees">{{ d.placesPayees }} payées ({{ d.dossiersPayes }} dossier{{ d.dossiersPayes > 1 ? 's' : '' }})</span>
                <span
                  v-if="d.placesReservees > d.placesPayees"
                  class="legende legende-options"
                >{{ d.placesReservees - d.placesPayees }} réservées, pas encore payées{{ d.options ? ` (dont ${d.placesOptions} en option)` : '' }}</span>
                <span
                  v-if="d.enCours"
                  class="text-grey-darken-1"
                >{{ d.enCours }} inscription{{ d.enCours > 1 ? 's' : '' }} en cours, pas encore payée{{ d.enCours > 1 ? 's' : '' }}</span>
              </div>
              <p class="text-body-2 mb-0">
                <template v-if="d.garanti">
                  <v-icon
                    :icon="mdiCheckCircle"
                    color="success"
                    size="18"
                    class="mr-1"
                  />Départ garanti : le minimum de {{ d.min }} voyageurs est atteint.
                </template>
                <template v-else-if="d.min">
                  Encore <b>{{ d.min - d.placesPayees }}</b> place{{ d.min - d.placesPayees > 1 ? 's' : '' }} payée{{ d.min - d.placesPayees > 1 ? 's' : '' }} pour garantir le départ (minimum {{ d.min }}).
                </template>
                <span
                  v-if="d.statut === 'ouverte'"
                  class="text-grey-darken-1"
                > Inscriptions ouvertes jusqu'au {{ jour(d.fermeture) }}.</span>
              </p>
            </div>
            <template v-if="vue.passes.length">
              <p class="text-subtitle-2 font-weight-bold mt-4 mb-2">
                Départs passés
              </p>
              <p
                v-for="d in vue.passes"
                :key="d.id"
                class="text-body-2 text-grey-darken-1 mb-1"
              >
                {{ periode(d.depart, d.retour) }} · {{ d.placesPayees }} voyageur{{ d.placesPayees > 1 ? 's' : '' }}
              </p>
            </template>
          </EspacePorteurSection>

          <!-- Proposer -->
          <EspacePorteurSection
            id="section-proposer"
            :numero="2"
            titre="Proposer une date"
            sous-titre="Odysway vous répond par email. Le prix et le nombre de places définitifs se fixent avec l'équipe."
            :icone="mdiCalendarPlus"
            couleur="#DB6644"
          >
            <v-alert
              v-if="message"
              :type="message.type"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="message = null"
            >
              {{ message.texte }}
            </v-alert>
            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.depart"
                  type="date"
                  label="Départ *"
                  variant="outlined"
                  :min="demain"
                  data-test="depart-saisie"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.retour"
                  type="date"
                  label="Retour *"
                  variant="outlined"
                  :min="form.depart || demain"
                  data-test="retour-saisie"
                />
              </v-col>
              <v-col
                cols="6"
                sm="4"
              >
                <v-text-field
                  v-model.number="form.participantsMin"
                  type="number"
                  min="1"
                  label="Participants min."
                  variant="outlined"
                />
              </v-col>
              <v-col
                cols="6"
                sm="4"
              >
                <v-text-field
                  v-model.number="form.participantsMax"
                  type="number"
                  min="1"
                  label="Participants max."
                  variant="outlined"
                />
              </v-col>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model.number="form.prixSouhaite"
                  type="number"
                  min="1"
                  label="Prix souhaité / pers."
                  suffix="€"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-textarea
              v-model="form.note"
              label="Un mot pour l'équipe (facultatif)"
              placeholder="Vacances scolaires, groupe déjà constitué, contraintes…"
              persistent-placeholder
              variant="outlined"
              rows="2"
              auto-grow
              maxlength="1000"
            />
            <v-btn
              color="secondary"
              rounded="pill"
              :loading="envoi"
              :prepend-icon="mdiSend"
              data-test="proposer"
              @click="proposer"
            >
              Proposer cette date
            </v-btn>
          </EspacePorteurSection>

          <!-- Propositions -->
          <EspacePorteurSection
            id="section-propositions"
            :numero="3"
            titre="Vos propositions"
            sous-titre="Les dates que vous avez proposées et la réponse d'Odysway."
            :icone="mdiCalendarQuestion"
            couleur="#E29A1F"
          >
            <p
              v-if="!vue.propositions.length"
              class="text-body-2 text-grey-darken-1 mb-0"
            >
              Aucune proposition pour l'instant.
            </p>
            <div
              v-for="p in vue.propositions"
              :key="p.id"
              class="proposition mb-3"
              data-test="proposition"
            >
              <div class="d-flex align-center flex-wrap ga-2">
                <span class="text-subtitle-1 font-weight-bold text-primary">{{ periode(p.depart, p.retour) }}</span>
                <v-spacer />
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="COULEURS_PROPOSITION[p.statut]"
                >
                  {{ portageDates.STATUTS_PROPOSITION[p.statut] }}
                </v-chip>
              </div>
              <p class="text-body-2 text-grey-darken-1 mt-1 mb-0">
                {{ resume(p) }}
              </p>
              <p
                v-if="p.note"
                class="text-body-2 mt-1 mb-0"
              >
                « {{ p.note }} »
              </p>
              <p
                v-if="p.reponse"
                class="proposition-reponse text-body-2 mt-2 mb-0"
              >
                <b>Odysway :</b> {{ p.reponse }}
              </p>
              <v-btn
                v-if="p.statut === 'proposee'"
                variant="text"
                color="error"
                size="small"
                class="mt-1 px-0"
                :loading="retrait === p.id"
                @click="retirer(p)"
              >
                Retirer la proposition
              </v-btn>
            </div>
          </EspacePorteurSection>
        </v-defaults-provider>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  mdiArrowLeft, mdiCalendarCheckOutline, mdiCalendarPlus, mdiCalendarQuestion, mdiCheckCircle, mdiSend,
} from '@mdi/js'
import portageDates from '#shared/portageDates.js'

// Dates et inscriptions d'un séjour, côté porteur : il propose des dates
// (Odysway accepte ou refuse dans Ulysse) et suit le remplissage des départs
// ouverts. Des comptes seulement : jamais l'identité des inscrits.

definePageMeta({ layout: 'blank' })
useHead({ title: 'Dates et inscriptions', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const CHAMP = { bgColor: 'white', rounded: 'lg', color: 'primary' }
const CHAMPS = { VTextField: CHAMP, VTextarea: CHAMP }
const COULEURS_DEPART = { ouverte: 'success', en_preparation: 'grey', complete: 'primary', fermee: 'warning', passee: 'grey' }
const COULEURS_PROPOSITION = { proposee: 'warning', acceptee: 'success', refusee: 'error', retiree: 'grey' }

const route = useRoute()
const pageId = route.params.pageId
const { api } = useEspacePorteur()

const vue = ref(null)
const chargement = ref(true)
const erreur = ref('')
const message = ref(null)
const envoi = ref(false)
const retrait = ref(null)
const formVide = () => ({ depart: '', retour: '', participantsMin: null, participantsMax: null, prixSouhaite: null, note: '' })
const form = ref(formVide())

const demain = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})

const jour = j => new Date(`${j}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const periode = (de, a) => (a && a !== de ? `Du ${jour(de)} au ${jour(a)}` : `Le ${jour(de)}`)
const pourcent = (n, d) => Math.min(100, Math.max(0, (n / Math.max(d.max || 0, d.placesReservees, 1)) * 100))
const resume = (p) => {
  const morceaux = []
  if (p.participantsMin || p.participantsMax) morceaux.push(`${p.participantsMin ?? '?'} à ${p.participantsMax ?? '?'} participants`)
  if (p.prixSouhaite) morceaux.push(`${p.prixSouhaite.toLocaleString('fr-FR')} € / pers. souhaité`)
  morceaux.push(`proposée le ${new Date(p.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`)
  return morceaux.join(' · ')
}

const charger = async () => {
  try {
    vue.value = await api(`/pages/${pageId}/dates`)
  }
  catch (err) {
    erreur.value = err?.statusCode === 401
      ? 'Votre lien a expiré. Demandez-en un nouveau à Odysway.'
      : err?.statusCode === 404 ? 'Cette page n\'existe pas.' : 'L\'espace est momentanément indisponible.'
  }
}

onMounted(async () => {
  await charger()
  chargement.value = false
})

const proposer = async () => {
  envoi.value = true
  message.value = null
  try {
    await api(`/pages/${pageId}/propositions`, { method: 'POST', body: form.value })
    form.value = formVide()
    message.value = { type: 'success', texte: 'Merci ! Votre date est envoyée à Odysway, qui vous répond par email.' }
    await charger()
  }
  catch (err) {
    message.value = { type: 'error', texte: err?.data?.statusMessage || 'La date n\'a pas pu être envoyée. Réessayez dans un instant.' }
  }
  finally {
    envoi.value = false
  }
}

const retirer = async (p) => {
  retrait.value = p.id
  try {
    await api(`/pages/${pageId}/propositions/${p.id}/retrait`, { method: 'POST' })
    await charger()
  }
  catch (err) {
    message.value = { type: 'error', texte: err?.data?.statusMessage || 'La proposition n\'a pas pu être retirée.' }
    await charger()
  }
  finally {
    retrait.value = null
  }
}
</script>

<style scoped>
.dates-porteur {
  min-height: 100vh;
  background: #FDF6F2;
}
.dates-barre {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(43, 76, 82, 0.08);
}
.dates-marque {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  letter-spacing: -0.01em;
}
/* Même fond que le constructeur (/espace-porteur/:id). */
.dates-fond {
  min-height: calc(100vh - 57px);
  background:
    radial-gradient(520px 380px at 0% 0%, rgba(219, 102, 68, 0.16), transparent 70%),
    radial-gradient(460px 420px at 100% 18%, rgba(240, 179, 72, 0.18), transparent 70%),
    radial-gradient(560px 520px at 10% 62%, rgba(35, 124, 140, 0.12), transparent 70%),
    radial-gradient(520px 460px at 100% 92%, rgba(125, 150, 118, 0.16), transparent 70%),
    linear-gradient(180deg, #FDF6F2 0%, #FBF0EC 45%, #F1F4F4 100%);
}
.dates-contenu {
  max-width: 760px;
  margin: 0 auto;
}
.dates-bandeau {
  border-radius: 28px;
  padding: 28px 26px 24px;
  color: #fff;
  background: linear-gradient(135deg, #2B4C52 0%, #237C8C 70%, #3D7B8A 100%);
  box-shadow: 0 18px 40px -22px rgba(43, 76, 82, 0.7);
}
.dates-bandeau-sur {
  letter-spacing: 0.1em;
  color: #F0B348;
}
.dates-bandeau-texte {
  color: rgba(255, 255, 255, 0.82);
}
.depart,
.proposition {
  background: #F6F8F8;
  border: 1px solid rgba(43, 76, 82, 0.07);
  border-radius: 16px;
  padding: 16px;
}
.jauge {
  position: relative;
  display: flex;
  height: 12px;
  border-radius: 999px;
  background: #E3E9E9;
  overflow: visible;
}
.jauge-payees {
  background: #2D5843;
  border-radius: 999px 0 0 999px;
}
.jauge-options {
  background: #F0B348;
}
.jauge-seuil {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: #DB6644;
  transform: translateX(-1px);
}
.legende::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.legende-payees::before {
  background: #2D5843;
}
.legende-options::before {
  background: #F0B348;
}
.proposition-reponse {
  background: #FBF0EC;
  border-radius: 12px;
  padding: 10px 12px;
}
</style>
