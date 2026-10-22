<template>
  <div class="editeur">
    <header class="editeur-barre d-flex align-center ga-2 ga-sm-3 px-2 px-sm-4 py-2">
      <v-btn
        to="/espace-porteur"
        variant="text"
        size="small"
        class="d-none d-sm-flex"
        :prepend-icon="mdiArrowLeft"
      >
        Mes pages
      </v-btn>
      <v-btn
        to="/espace-porteur"
        variant="text"
        size="small"
        class="d-sm-none"
        :icon="mdiArrowLeft"
        aria-label="Mes pages"
      />
      <v-chip
        v-if="page"
        :color="STATUTS[page.statut].couleur"
        size="small"
        variant="tonal"
        class="d-none d-sm-flex"
      >
        {{ STATUTS[page.statut].libelle }}
      </v-chip>
      <span
        class="text-caption text-grey-darken-1"
        data-test="etat-sauvegarde"
      >{{ etatSauvegarde }}</span>
      <v-spacer />
      <v-btn
        class="d-md-none"
        variant="tonal"
        size="small"
        color="primary"
        @click="apercuMobile = true"
      >
        Aperçu
      </v-btn>
      <v-btn
        color="secondary"
        rounded="pill"
        :loading="soumission"
        :disabled="!page || page.statut === 'soumis'"
        data-test="soumettre"
        @click="soumettre"
      >
        {{ page?.statut === 'soumis' ? 'Soumise' : page?.publieLe ? 'Soumettre les modifications' : 'Soumettre à Odysway' }}
      </v-btn>
    </header>

    <div
      v-if="!page && !erreur"
      class="d-flex justify-center py-16"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>

    <v-alert
      v-else-if="erreur && !page"
      type="warning"
      variant="tonal"
      class="ma-6"
    >
      {{ erreur }}
    </v-alert>

    <div
      v-else
      class="editeur-corps"
    >
      <section class="editeur-formulaire px-4 py-6">
        <v-alert
          v-if="message"
          :type="message.type"
          variant="tonal"
          class="mb-6"
          closable
          @click:close="message = null"
        >
          {{ message.texte }}
        </v-alert>
        <v-alert
          v-if="page.statut === 'soumis'"
          type="info"
          variant="tonal"
          class="mb-6"
        >
          Votre page est en relecture chez Odysway. Vous pouvez encore la modifier : il faudra alors la soumettre de nouveau.
        </v-alert>
        <v-alert
          v-else-if="page.lienPublic"
          type="success"
          variant="tonal"
          class="mb-6"
        >
          Votre page est en ligne : <a
            :href="page.lienPublic"
            target="_blank"
            rel="noopener"
          >{{ page.lienPublic }}</a>.
          Vos modifications n'y apparaîtront qu'après une nouvelle soumission et la relecture d'Odysway.
        </v-alert>

        <!-- L'essentiel -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          L'essentiel
        </h2>
        <v-text-field
          v-model="payload.titre"
          label="Titre du séjour *"
          variant="outlined"
          maxlength="120"
          counter
          data-test="titre"
        />
        <v-textarea
          v-model="payload.accroche"
          label="Accroche (deux ou trois phrases)"
          variant="outlined"
          rows="2"
          auto-grow
          maxlength="400"
          counter
        />
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model.number="payload.dureeJours"
              type="number"
              min="1"
              label="Durée (jours)"
              variant="outlined"
              hint="Par défaut : le nombre de jours du programme"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model.number="payload.prixIndicatif"
              type="number"
              min="1"
              label="Prix indicatif par personne"
              suffix="€"
              variant="outlined"
              hint="Indicatif : Odysway fixe avec vous les prix et les dates"
              persistent-hint
            />
          </v-col>
        </v-row>

        <v-divider class="my-8" />

        <!-- Photos -->
        <h2 class="text-h5 font-weight-bold text-primary mb-2">
          Photos
        </h2>
        <p class="text-body-2 text-grey-darken-1 mb-4">
          Une grande photo horizontale pour l'en-tête de la page, puis une galerie.
        </p>
        <p class="text-subtitle-2 font-weight-bold mb-2">
          Image principale *
        </p>
        <EspacePorteurChampImage
          v-model="payload.image"
          label="Choisir l'image principale"
          avec-alt
        />
        <p class="text-subtitle-2 font-weight-bold mt-6 mb-2">
          Galerie
        </p>
        <div
          v-for="(photo, i) in payload.galerie"
          :key="photo.cle"
          class="mb-3"
        >
          <EspacePorteurChampImage
            :model-value="photo"
            avec-alt
            compact
            @update:model-value="v => v ? (payload.galerie[i] = { ...v, cle: photo.cle }) : payload.galerie.splice(i, 1)"
          />
        </div>
        <EspacePorteurChampImage
          :model-value="null"
          label="Ajouter une photo à la galerie"
          avec-alt
          @update:model-value="v => v && payload.galerie.push({ ...v, cle: nouvelleCle() })"
        />

        <v-divider class="my-8" />

        <!-- Vous -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          Vous, l'accompagnateur
        </h2>
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="payload.accompagnateur.nom"
              label="Votre nom"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="payload.accompagnateur.role"
              label="Votre rôle (ex. Professeure de yoga)"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <EspacePorteurChampImage
          v-model="payload.accompagnateur.photo"
          label="Votre photo"
          class="mb-4"
        />
        <v-textarea
          v-model="payload.accompagnateur.presentation"
          label="Présentez-vous"
          variant="outlined"
          rows="3"
          auto-grow
        />
        <v-textarea
          v-model="payload.mot"
          label="Votre mot sur le séjour *"
          variant="outlined"
          rows="5"
          auto-grow
          :hint="AIDE_TEXTE"
          persistent-hint
          data-test="mot"
        />

        <v-divider class="my-8" />

        <!-- Programme -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          Programme jour par jour *
        </h2>
        <v-card
          v-for="(jour, i) in payload.programme"
          :key="jour.cle"
          variant="outlined"
          rounded="lg"
          class="mb-4 pa-4"
        >
          <div class="d-flex align-center mb-3">
            <span class="text-subtitle-1 font-weight-bold">Jour {{ i + 1 }}</span>
            <v-spacer />
            <EspacePorteurOrdreBoutons
              :index="i"
              :total="payload.programme.length"
              @deplacer="sens => deplacer(payload.programme, i, sens)"
              @supprimer="payload.programme.splice(i, 1)"
            />
          </div>
          <v-text-field
            v-model="jour.titre"
            label="Titre de la journée"
            variant="outlined"
            density="comfortable"
          />
          <v-textarea
            v-model="jour.texte"
            label="Déroulé de la journée"
            variant="outlined"
            rows="3"
            auto-grow
            :hint="AIDE_TEXTE"
          />
          <v-text-field
            v-model="jour.nuit"
            label="Nuit (ex. à l'hôtel, en refuge…)"
            variant="outlined"
            density="comfortable"
          />
          <EspacePorteurChampImage
            v-model="jour.photo"
            label="Photo de la journée"
            compact
          />
        </v-card>
        <v-btn
          variant="tonal"
          color="primary"
          :prepend-icon="mdiPlus"
          data-test="ajouter-jour"
          @click="payload.programme.push({ cle: nouvelleCle(), titre: '', texte: '', nuit: '', photo: null })"
        >
          Ajouter un jour
        </v-btn>

        <v-divider class="my-8" />

        <!-- Hébergement -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          Hébergement
        </h2>
        <v-card
          v-for="(h, i) in payload.hebergements"
          :key="h.cle"
          variant="outlined"
          rounded="lg"
          class="mb-4 pa-4"
        >
          <div class="d-flex align-center mb-3">
            <span class="text-subtitle-1 font-weight-bold">Hébergement {{ i + 1 }}</span>
            <v-spacer />
            <EspacePorteurOrdreBoutons
              :index="i"
              :total="payload.hebergements.length"
              @deplacer="sens => deplacer(payload.hebergements, i, sens)"
              @supprimer="payload.hebergements.splice(i, 1)"
            />
          </div>
          <v-row dense>
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="h.titre"
                label="Nom (ex. Villa Elia)"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="h.type"
                label="Type (ex. Maison d'hôtes)"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
          <v-textarea
            v-model="h.description"
            label="Ambiance, chambres, repas…"
            variant="outlined"
            rows="3"
            auto-grow
          />
          <div
            v-for="(photo, j) in h.photos"
            :key="photo.cle"
            class="mb-3"
          >
            <EspacePorteurChampImage
              :model-value="photo"
              avec-alt
              compact
              @update:model-value="v => v ? (h.photos[j] = { ...v, cle: photo.cle }) : h.photos.splice(j, 1)"
            />
          </div>
          <EspacePorteurChampImage
            :model-value="null"
            label="Ajouter une photo"
            avec-alt
            compact
            @update:model-value="v => v && h.photos.push({ ...v, cle: nouvelleCle() })"
          />
        </v-card>
        <v-btn
          variant="tonal"
          color="primary"
          :prepend-icon="mdiPlus"
          @click="payload.hebergements.push({ cle: nouvelleCle(), titre: '', type: '', description: '', photos: [] })"
        >
          Ajouter un hébergement
        </v-btn>

        <v-divider class="my-8" />

        <!-- Inclus / non inclus -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          Ce qui est inclus, ou non
        </h2>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-textarea
              v-model="inclusTexte"
              label="Inclus (une ligne par élément)"
              variant="outlined"
              rows="5"
              auto-grow
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-textarea
              v-model="nonInclusTexte"
              label="Non inclus (une ligne par élément)"
              variant="outlined"
              rows="5"
              auto-grow
            />
          </v-col>
        </v-row>

        <v-divider class="my-8" />

        <!-- FAQ -->
        <h2 class="text-h5 font-weight-bold text-primary mb-4">
          Questions fréquentes
        </h2>
        <v-card
          v-for="(q, i) in payload.faq"
          :key="q.cle"
          variant="outlined"
          rounded="lg"
          class="mb-4 pa-4"
        >
          <div class="d-flex align-center mb-3">
            <span class="text-subtitle-1 font-weight-bold">Question {{ i + 1 }}</span>
            <v-spacer />
            <EspacePorteurOrdreBoutons
              :index="i"
              :total="payload.faq.length"
              @deplacer="sens => deplacer(payload.faq, i, sens)"
              @supprimer="payload.faq.splice(i, 1)"
            />
          </div>
          <v-text-field
            v-model="q.question"
            label="Question"
            variant="outlined"
            density="comfortable"
          />
          <v-textarea
            v-model="q.reponse"
            label="Réponse"
            variant="outlined"
            rows="2"
            auto-grow
          />
        </v-card>
        <v-btn
          variant="tonal"
          color="primary"
          :prepend-icon="mdiPlus"
          @click="payload.faq.push({ cle: nouvelleCle(), question: '', reponse: '' })"
        >
          Ajouter une question
        </v-btn>

        <div class="py-12" />
      </section>

      <aside class="editeur-apercu d-none d-md-flex flex-column">
        <div class="d-flex align-center ga-2 px-4 py-2">
          <span class="text-caption font-weight-bold text-uppercase text-grey-darken-1">Aperçu</span>
          <v-spacer />
          <v-btn-toggle
            v-model="format"
            density="compact"
            mandatory
            variant="outlined"
            divided
          >
            <v-btn
              value="ordinateur"
              size="small"
              :icon="mdiMonitor"
              aria-label="Aperçu ordinateur"
            />
            <v-btn
              value="mobile"
              size="small"
              :icon="mdiCellphone"
              aria-label="Aperçu mobile"
            />
          </v-btn-toggle>
        </div>
        <div
          ref="cadreApercu"
          class="editeur-apercu-cadre flex-grow-1"
        >
          <iframe
            ref="iframe"
            :src="`/espace-porteur/apercu/${pageId}`"
            title="Aperçu de la page"
            :style="styleIframe"
          />
        </div>
      </aside>
    </div>

    <v-dialog
      v-model="apercuMobile"
      fullscreen
    >
      <v-card>
        <v-toolbar
          density="compact"
          color="white"
        >
          <v-toolbar-title class="text-body-1">
            Aperçu
          </v-toolbar-title>
          <v-btn
            :icon="mdiClose"
            aria-label="Fermer l'aperçu"
            @click="apercuMobile = false"
          />
        </v-toolbar>
        <iframe
          ref="iframeMobile"
          :src="`/espace-porteur/apercu/${pageId}`"
          title="Aperçu de la page"
          class="apercu-plein"
        />
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="conflit"
      max-width="420"
      persistent
    >
      <v-card>
        <v-card-title>Page modifiée ailleurs</v-card-title>
        <v-card-text>Cette page a été enregistrée depuis une autre fenêtre. Rechargez pour reprendre la dernière version.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="recharger"
          >
            Recharger
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { mdiArrowLeft, mdiCellphone, mdiClose, mdiMonitor, mdiPlus } from '@mdi/js'
import portagePage from '#shared/portagePage.js'

definePageMeta({ layout: 'blank' })
useHead({ title: 'Ma page de séjour', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const AIDE_TEXTE = 'Une ligne = un paragraphe. Commencez une ligne par « - » pour une liste à puces.'
const STATUTS = {
  brouillon: { libelle: 'Brouillon', couleur: 'grey' },
  soumis: { libelle: 'En relecture chez Odysway', couleur: 'primary' },
  publie: { libelle: 'En ligne', couleur: 'success' },
}
const DELAI_SAUVEGARDE_MS = 1200
const LARGEUR_ORDINATEUR = 1280
const LARGEUR_MOBILE = 390

const route = useRoute()
const pageId = route.params.pageId
const { api, nouvelleCle } = useEspacePorteur()

const page = ref(null)
const payload = ref(portagePage.vide())
const erreur = ref('')
const message = ref(null)
const soumission = ref(false)
const conflit = ref(false)
const apercuMobile = ref(false)
const format = ref('ordinateur')

// --- Chargement ------------------------------------------------------------

const inclusTexte = ref('')
const nonInclusTexte = ref('')
// Le texte reste tel que tapé (lignes vides comprises) ; le brouillon ne garde
// que les lignes remplies.
const lignes = t => t.split('\n').map(l => l.trim()).filter(Boolean)
watch(inclusTexte, (t) => {
  payload.value.inclus = lignes(t)
})
watch(nonInclusTexte, (t) => {
  payload.value.nonInclus = lignes(t)
})

const deplacer = (liste, i, sens) => {
  const cible = i + sens
  if (cible < 0 || cible >= liste.length) return
  const [element] = liste.splice(i, 1)
  liste.splice(cible, 0, element)
}

let chargeEnCours = true
const appliquer = (vue) => {
  chargeEnCours = true
  page.value = vue
  payload.value = vue.payload
  inclusTexte.value = vue.payload.inclus.join('\n')
  nonInclusTexte.value = vue.payload.nonInclus.join('\n')
  nextTick(() => {
    chargeEnCours = false
  })
}

onMounted(async () => {
  try {
    appliquer(await api(`/pages/${pageId}`))
  }
  catch (err) {
    erreur.value = err?.statusCode === 401
      ? 'Votre lien a expiré. Demandez-en un nouveau à Odysway.'
      : err?.statusCode === 404 ? 'Cette page n\'existe pas.' : 'L\'espace est momentanément indisponible.'
  }
  window.addEventListener('message', surMessage)
  window.addEventListener('beforeunload', avantDepart)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', surMessage)
  window.removeEventListener('beforeunload', avantDepart)
  if (minuteur) sauvegarder()
})

const recharger = () => window.location.reload()

// --- Sauvegarde automatique -----------------------------------------------

const etat = ref('enregistre')
const enregistreA = ref(null)
let minuteur = null
let enCours = null

const etatSauvegarde = computed(() => ({
  modifie: 'Modifications en attente…',
  enregistrement: 'Enregistrement…',
  erreur: 'Enregistrement impossible, nouvel essai bientôt',
  enregistre: enregistreA.value ? `Enregistré à ${enregistreA.value}` : '',
})[etat.value])

const sauvegarder = async () => {
  clearTimeout(minuteur)
  minuteur = null
  if (enCours) await enCours
  if (!page.value) return
  etat.value = 'enregistrement'
  enCours = api(`/pages/${pageId}`, {
    method: 'POST',
    body: { payload: payload.value, revision: page.value.revision },
  }).then((vue) => {
    // Seuls les métadonnées reviennent : le formulaire garde ce qui a été tapé
    // pendant l'envoi.
    page.value = { ...vue, payload: page.value.payload }
    enregistreA.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    etat.value = minuteur ? 'modifie' : 'enregistre'
  }).catch((err) => {
    if (err?.statusCode === 409) {
      conflit.value = true
      etat.value = 'erreur'
      return
    }
    etat.value = 'erreur'
    minuteur = setTimeout(sauvegarder, 5000)
  }).finally(() => { enCours = null })
  await enCours
}

watch(payload, () => {
  envoyerApercu()
  if (chargeEnCours) return
  etat.value = 'modifie'
  clearTimeout(minuteur)
  minuteur = setTimeout(sauvegarder, DELAI_SAUVEGARDE_MS)
}, { deep: true })

const avantDepart = (e) => {
  if (etat.value === 'enregistre') return
  sauvegarder()
  e.preventDefault()
}

// --- Soumission ------------------------------------------------------------

const soumettre = async () => {
  const manque = portagePage.manques(payload.value)
  if (manque.length) {
    message.value = { type: 'warning', texte: `Avant de soumettre, ajoutez ${manque.join(', ')}.` }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  soumission.value = true
  try {
    if (minuteur || enCours || etat.value === 'erreur') await sauvegarder()
    const vue = await api(`/pages/${pageId}/soumettre`, { method: 'POST' })
    page.value = { ...vue, payload: page.value.payload }
    message.value = { type: 'success', texte: 'Merci ! Votre page est envoyée à Odysway pour relecture. Nous revenons vers vous avant sa mise en ligne.' }
  }
  catch (err) {
    message.value = { type: 'error', texte: err?.data?.statusMessage || 'La soumission n\'a pas pu aboutir. Réessayez dans un instant.' }
  }
  finally {
    soumission.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// --- Aperçu ----------------------------------------------------------------
//
// L'aperçu vit dans une iframe de même origine : la page y a sa propre largeur,
// donc les vrais points de rupture de Vuetify (ordinateur / mobile). Le
// brouillon lui est passé par postMessage à chaque frappe.

const iframe = ref(null)
const iframeMobile = ref(null)
const cadreApercu = ref(null)
const largeurCadre = ref(600)
let observateur = null

onMounted(() => {
  observateur = new ResizeObserver(([entree]) => {
    largeurCadre.value = entree.contentRect.width
  })
  watch(cadreApercu, (el) => {
    if (el) observateur.observe(el)
  }, { immediate: true })
})
onBeforeUnmount(() => observateur?.disconnect())

const styleIframe = computed(() => {
  const largeur = format.value === 'mobile' ? LARGEUR_MOBILE : LARGEUR_ORDINATEUR
  const echelle = Math.min(1, largeurCadre.value / largeur)
  return {
    width: `${largeur}px`,
    height: `${100 / echelle}%`,
    transform: `scale(${echelle})`,
    transformOrigin: 'top left',
    marginLeft: format.value === 'mobile' ? `${Math.max(0, (largeurCadre.value - largeur) / 2)}px` : 0,
  }
})

let minuteurApercu = null
const envoyerApercu = () => {
  clearTimeout(minuteurApercu)
  minuteurApercu = setTimeout(() => {
    const donnees = JSON.parse(JSON.stringify({ type: 'portage-apercu', payload: payload.value }))
    for (const f of [iframe.value, iframeMobile.value]) f?.contentWindow?.postMessage(donnees, window.location.origin)
  }, 250)
}

const surMessage = (e) => {
  if (e.origin !== window.location.origin || e.data?.type !== 'portage-apercu-pret') return
  envoyerApercu()
}
</script>

<style scoped>
.editeur {
  min-height: 100vh;
  background: #fff;
}
.editeur-barre {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.editeur-corps {
  display: flex;
}
.editeur-formulaire {
  flex: 1 1 520px;
  max-width: 720px;
  min-width: 0;
}
.editeur-apercu {
  flex: 1 1 0;
  position: sticky;
  top: 57px;
  height: calc(100vh - 57px);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: #F1F4F4;
  min-width: 0;
}
.editeur-apercu-cadre {
  overflow: hidden;
  position: relative;
}
.editeur-apercu-cadre iframe {
  border: 0;
  background: #fff;
  display: block;
}
.apercu-plein {
  border: 0;
  width: 100%;
  height: calc(100vh - 48px);
}
</style>
