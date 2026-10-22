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
      <span class="editeur-marque d-none d-sm-inline">odysway<span class="text-secondary">.</span></span>
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
        :to="`/espace-porteur/dates/${pageId}`"
        variant="text"
        size="small"
        color="primary"
        class="d-none d-sm-flex"
        :prepend-icon="mdiCalendarMonthOutline"
        data-test="lien-dates"
      >
        Dates et inscriptions
      </v-btn>
      <v-btn
        :to="`/espace-porteur/dates/${pageId}`"
        variant="text"
        size="small"
        color="primary"
        class="d-sm-none"
        :icon="mdiCalendarMonthOutline"
        aria-label="Dates et inscriptions"
      />
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
        <span class="d-sm-none">{{ page?.statut === 'soumis' ? 'Soumise' : 'Soumettre' }}</span>
        <span class="d-none d-sm-inline">{{ page?.statut === 'soumis' ? 'Soumise' : page?.publieLe ? 'Soumettre les modifications' : 'Soumettre à Odysway' }}</span>
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
      <section class="editeur-formulaire px-4 px-md-6 py-6">
        <v-defaults-provider :defaults="CHAMPS">
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

          <div class="editeur-bandeau mb-5">
            <div class="editeur-bandeau-contenu">
              <p class="editeur-bandeau-sur text-caption font-weight-bold text-uppercase mb-2">
                Espace porteur · votre page de séjour
              </p>
              <h1 class="text-h4 font-weight-bold mb-2">
                {{ payload.titre || 'Votre séjour, raconté par vous' }}
              </h1>
              <p class="text-body-2 mb-5 editeur-bandeau-texte">
                Remplissez les sections à votre rythme : l'aperçu montre la page telle que vos voyageurs la verront.
              </p>
              <div class="d-flex align-center ga-3">
                <v-progress-linear
                  :model-value="progression.pourcentage"
                  color="yellow"
                  bg-color="white"
                  bg-opacity="0.25"
                  height="8"
                  rounded
                />
                <span class="text-body-2 font-weight-bold text-no-wrap">{{ progression.remplies }}/{{ progression.total }} sections</span>
              </div>
              <p
                v-if="manquants.length"
                class="text-caption mt-2 mb-0 editeur-bandeau-texte"
              >
                Encore requis pour soumettre : {{ manquants.join(', ') }}.
              </p>
              <p
                v-else
                class="text-caption mt-2 mb-0 editeur-bandeau-texte"
              >
                L'essentiel est là : vous pouvez soumettre la page quand vous voulez.
              </p>
            </div>
          </div>

          <nav
            class="editeur-sommaire d-flex ga-2 mb-5"
            aria-label="Sections de la page"
          >
            <button
              v-for="(section, cle) in sections"
              :key="cle"
              type="button"
              class="editeur-sommaire-lien"
              :class="{ 'editeur-sommaire-lien--rempli': section.complete }"
              :style="{ '--accent': section.couleur }"
              @click="allerA(section.id)"
            >
              <v-icon
                :icon="section.complete ? mdiCheckCircle : section.icone"
                size="16"
              />
              {{ section.court }}
            </button>
          </nav>

          <EspacePorteurSection v-bind="sections.essentiel">
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
              hint="Reprise dans l'aperçu du lien quand vous le partagez (WhatsApp, réseaux…)"
              persistent-hint
            />
            <v-row
              dense
              class="mt-2"
            >
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
            <v-select
              v-model="payload.niveau"
              :items="choixNiveaux"
              label="Niveau de difficulté"
              variant="outlined"
              clearable
              class="mt-4"
              hint="Affiché en pastille sous le titre"
              persistent-hint
              data-test="niveau"
            />

            <p class="text-subtitle-2 font-weight-bold mt-6 mb-1">
              Badges
            </p>
            <p class="text-body-2 text-grey-darken-1 mb-3">
              Les pastilles sous le titre, à côté du niveau : durée, taille du groupe, hébergement, période…
            </p>
            <div
              v-for="(b, i) in payload.badges"
              :key="b.cle"
              class="d-flex align-start ga-2 mb-3"
              data-test="badge"
            >
              <div class="flex-grow-1">
                <v-select
                  v-model="b.badge"
                  :items="choixBadges"
                  :item-props="itemBadge"
                  label="Badge"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
                <v-row
                  v-if="variablesBadge(b.badge).length"
                  dense
                  class="mt-1"
                >
                  <v-col
                    v-for="v in variablesBadge(b.badge)"
                    :key="v.cle"
                    cols="12"
                    :sm="variablesBadge(b.badge).length > 1 ? 6 : 12"
                  >
                    <v-text-field
                      v-model="b[v.cle]"
                      :label="v.libelle"
                      :placeholder="v.exemple"
                      persistent-placeholder
                      variant="outlined"
                      density="compact"
                      maxlength="60"
                      hide-details
                    />
                  </v-col>
                </v-row>
                <p
                  v-if="b.badge"
                  class="text-caption text-grey-darken-1 mt-1 mb-0"
                >
                  Affiché : « {{ texteBadge(b) }} »
                </p>
              </div>
              <EspacePorteurOrdreBoutons
                :index="i"
                :total="payload.badges.length"
                @deplacer="sens => deplacer(payload.badges, i, sens)"
                @supprimer="payload.badges.splice(i, 1)"
              />
            </div>
            <v-btn
              v-if="payload.badges.length < 8"
              variant="outlined"
              color="primary"
              class="bouton-ajout"
              :prepend-icon="mdiPlus"
              data-test="ajouter-badge"
              @click="payload.badges.push({ cle: nouvelleCle(), badge: null, var1: '', var2: '' })"
            >
              Ajouter un badge
            </v-btn>
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.photos">
            <p class="text-subtitle-2 font-weight-bold mb-2">
              Image principale *
            </p>
            <EspacePorteurChampImage
              v-model="payload.image"
              label="Choisir l'image principale"
              avec-alt
            />
            <p class="text-subtitle-2 font-weight-bold mt-6 mb-2">
              Image secondaire
            </p>
            <EspacePorteurChampImage
              v-model="payload.imageSecondaire"
              label="Choisir l'image secondaire"
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
            <v-textarea
              v-model="videosTexte"
              label="Vidéos YouTube ou Vimeo (un lien par ligne)"
              variant="outlined"
              rows="2"
              auto-grow
              class="mt-6"
              :error-messages="videosRefusees.length ? `Lien non reconnu : ${videosRefusees.join(', ')}` : []"
              hint="Un bouton « Vidéo » s'ajoute sur la photo d'en-tête"
              persistent-hint
              data-test="videos"
            />
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.equipe">
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
              :hint="AIDE_TEXTE"
            />
            <v-textarea
              v-model="payload.equipeIntro"
              label="Quelques mots sur l'équipe (facultatif)"
              variant="outlined"
              rows="2"
              auto-grow
              hint="Affiché en tête de la section « Les accompagnateurs »"
              persistent-hint
              class="mb-4"
            />
            <v-card
              v-for="(a, i) in payload.equipe"
              :key="a.cle"
              variant="flat"
              rounded="xl"
              class="carte-element mb-4 pa-4"
            >
              <div class="d-flex align-center mb-3">
                <span class="text-subtitle-1 font-weight-bold">Accompagnateur {{ i + 2 }}</span>
                <v-spacer />
                <EspacePorteurOrdreBoutons
                  :index="i"
                  :total="payload.equipe.length"
                  @deplacer="sens => deplacer(payload.equipe, i, sens)"
                  @supprimer="payload.equipe.splice(i, 1)"
                />
              </div>
              <v-row dense>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="a.nom"
                    label="Nom"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="a.role"
                    label="Rôle (ex. Guide de montagne)"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
              <EspacePorteurChampImage
                v-model="a.photo"
                label="Photo"
                compact
                class="mb-4"
              />
              <v-textarea
                v-model="a.presentation"
                label="Présentation"
                variant="outlined"
                rows="2"
                auto-grow
              />
            </v-card>
            <v-btn
              variant="outlined"
              color="primary"
              class="bouton-ajout"
              :prepend-icon="mdiPlus"
              data-test="ajouter-accompagnateur"
              @click="payload.equipe.push({ cle: nouvelleCle(), nom: '', role: '', presentation: '', photo: null })"
            >
              Ajouter un accompagnateur
            </v-btn>
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.mot">
            <v-textarea
              v-model="payload.mot"
              label="Votre mot *"
              variant="outlined"
              rows="5"
              auto-grow
              :hint="AIDE_TEXTE"
              persistent-hint
              data-test="mot"
            />
            <v-text-field
              v-model="payload.motSignature"
              label="Complément de signature (facultatif)"
              variant="outlined"
              maxlength="160"
              class="mt-4"
              hint="Après votre rôle, ex. « fondatrice de l'école Shanti »"
              persistent-hint
              data-test="mot-signature"
            />
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.pointsForts">
            <v-textarea
              v-model="pointsFortsTexte"
              label="Un point fort par ligne"
              variant="outlined"
              rows="4"
              auto-grow
              hint="Ex. « Deux cours de yoga par jour face à la mer ». **gras** et *italique* possibles."
              persistent-hint
              data-test="points-forts"
            />
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.programme">
            <v-card
              v-for="(jour, i) in payload.programme"
              :key="jour.cle"
              variant="flat"
              rounded="xl"
              class="carte-element mb-4 pa-4"
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
              <v-row dense>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="jour.etiquette"
                    :placeholder="`JOUR ${i + 1}`"
                    persistent-placeholder
                    label="Étiquette"
                    variant="outlined"
                    density="comfortable"
                    maxlength="40"
                    hint="Ex. JOURS 3 À 5"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="8"
                >
                  <v-text-field
                    v-model="jour.titre"
                    label="Titre de la journée"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
              <v-textarea
                v-model="jour.texte"
                label="Déroulé de la journée"
                variant="outlined"
                rows="3"
                auto-grow
                :hint="AIDE_TEXTE"
              />
              <v-row dense>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="jour.denivele"
                    label="Dénivelé"
                    placeholder="+600 m"
                    persistent-placeholder
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="jour.trajet"
                    label="Trajet"
                    placeholder="2 h de route"
                    persistent-placeholder
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="jour.nuit"
                    label="Nuit"
                    placeholder="En refuge"
                    persistent-placeholder
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
              <EspacePorteurChampImage
                v-model="jour.photo"
                label="Photo de la journée"
                compact
              />
            </v-card>
            <v-btn
              variant="outlined"
              color="primary"
              class="bouton-ajout"
              :prepend-icon="mdiPlus"
              data-test="ajouter-jour"
              @click="payload.programme.push({ cle: nouvelleCle(), etiquette: '', titre: '', texte: '', denivele: '', trajet: '', nuit: '', photo: null })"
            >
              Ajouter un jour
            </v-btn>
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.hebergement">
            <v-card
              v-for="(h, i) in payload.hebergements"
              :key="h.cle"
              variant="flat"
              rounded="xl"
              class="carte-element mb-4 pa-4"
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
                :hint="AIDE_TEXTE"
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
              variant="outlined"
              color="primary"
              class="bouton-ajout"
              :prepend-icon="mdiPlus"
              @click="payload.hebergements.push({ cle: nouvelleCle(), titre: '', type: '', description: '', photos: [] })"
            >
              Ajouter un hébergement
            </v-btn>
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.inclus">
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
          </EspacePorteurSection>

          <EspacePorteurSection v-bind="sections.faq">
            <v-card
              v-for="(q, i) in payload.faq"
              :key="q.cle"
              variant="flat"
              rounded="xl"
              class="carte-element mb-4 pa-4"
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
                :hint="AIDE_TEXTE"
              />
            </v-card>
            <v-btn
              variant="outlined"
              color="primary"
              class="bouton-ajout"
              :prepend-icon="mdiPlus"
              @click="payload.faq.push({ cle: nouvelleCle(), question: '', reponse: '' })"
            >
              Ajouter une question
            </v-btn>
          </EspacePorteurSection>

          <div class="editeur-fin text-center py-8 px-4">
            <p class="text-body-1 font-weight-bold text-primary mb-1">
              Tout est enregistré au fil de l'eau.
            </p>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              Quand la page vous plaît, envoyez-la : l'équipe Odysway la relit avec vous avant sa mise en ligne.
            </p>
            <v-btn
              color="secondary"
              rounded="pill"
              size="large"
              :loading="soumission"
              :disabled="page.statut === 'soumis'"
              :append-icon="mdiSend"
              @click="soumettre"
            >
              {{ page.statut === 'soumis' ? 'Page envoyée en relecture' : 'Soumettre à Odysway' }}
            </v-btn>
          </div>
        </v-defaults-provider>
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
import {
  mdiAccountGroupOutline, mdiArrowLeft, mdiCalendarMonthOutline, mdiCellphone, mdiChatQuestionOutline, mdiCheckCircle, mdiCheckDecagramOutline,
  mdiClose, mdiCompassOutline, mdiFeather, mdiHeartOutline, mdiHomeVariantOutline, mdiImageMultipleOutline,
  mdiMapMarkerPath, mdiMonitor, mdiPlus, mdiSend,
} from '@mdi/js'
import { stegaClean } from '@sanity/client/stega'
import portagePage from '#shared/portagePage.js'

definePageMeta({ layout: 'blank' })
useHead({ title: 'Ma page de séjour', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const AIDE_TEXTE = 'Une ligne = un paragraphe. « - » en début de ligne pour une puce, **gras**, *italique*.'
const STATUTS = {
  brouillon: { libelle: 'Brouillon', couleur: 'grey' },
  soumis: { libelle: 'En relecture chez Odysway', couleur: 'primary' },
  publie: { libelle: 'En ligne', couleur: 'success' },
}
// Champs du constructeur : blancs et arrondis sur les cartes (le thème du site
// les veut gris clair).
const CHAMP = { bgColor: 'white', rounded: 'lg', color: 'primary' }
const CHAMPS = { VTextField: CHAMP, VTextarea: CHAMP, VSelect: CHAMP }
const DELAI_SAUVEGARDE_MS = 1200
const LARGEUR_ORDINATEUR = 1280
const LARGEUR_MOBILE = 390

const route = useRoute()
const pageId = route.params.pageId
const { api, nouvelleCle, urlImage } = useEspacePorteur()

// Titres des sections tels que la page les affiche (Sanity, page_voyage), et
// les niveaux de difficulté au choix.
const [{ data: pageVoyage }, { data: niveaux }, { data: badgesDispo }] = await Promise.all([
  useSanityQuery(VOYAGE_PAGE_QUERY),
  useSanityQuery(NIVEAUX_DIFFICULTE_QUERY),
  useSanityQuery(BADGES_QUERY),
])
const titresPage = computed(() => ({
  mot: stegaClean(pageVoyage.value?.authorNote?.title) || 'L\'esprit du voyage',
  pointsForts: stegaClean(pageVoyage.value?.experiencesBlock?.title) || 'Ce que vous allez vivre',
}))
const choixNiveaux = computed(() => (niveaux.value || [])
  .map(n => ({ value: n._id, title: `Niveau ${n.level} · ${stegaClean(n.title)}` })))

// Badges : la liste d'Odysway. Un texte réduit à « {var1} » (durée, logement…)
// est nommé d'après le titre du badge ; les variables sont remplies ici.
const badgesParId = computed(() => new Map((badgesDispo.value || []).map(b => [b._id, {
  ...b,
  title: stegaClean(b.title),
  text: stegaClean(b.text || '').trim(),
}])))
// Badge à variables : nommé d'après son titre, le texte en sous-titre.
const libelleBadge = b => (b.text.includes('{var') ? b.title.replace(/^badge\s+/i, '') : b.text)
const choixBadges = computed(() => [...badgesParId.value.values()].map(b => ({
  value: b._id,
  title: libelleBadge(b),
  modele: b.text.includes('{var') && !/^\{var1\}$/.test(b.text) ? b.text.replace(/\{var[12]\}/g, '…') : '',
  picto: b.picto,
})))
const itemBadge = item => ({
  title: item.title,
  value: item.value,
  subtitle: item.modele || undefined,
  prependAvatar: item.picto?.asset?._ref ? urlImage(item.picto.asset._ref, 64) : undefined,
})
const EXEMPLES_BADGE = { 'Logement': 'Chez l\'habitant', 'Durée': '8 jours', 'Âge': 'Dès 12 ans', 'Période': 'Avril', 'Période Saison': 'Printemps' }
const variablesBadge = (id) => {
  const b = badgesParId.value.get(id)
  if (!b) return []
  const seul = /^\{var1\}$/.test(b.text)
  const libelle = (brut, defaut) => (brut && !/^\d+$/.test(stegaClean(brut)) ? stegaClean(brut) : defaut)
  return [
    b.text.includes('{var1}') && {
      cle: 'var1',
      libelle: seul ? 'Texte du badge' : libelle(b.variable1Label, 'Première valeur'),
      exemple: seul ? EXEMPLES_BADGE[libelleBadge(b)] || '' : '',
    },
    b.text.includes('{var2}') && { cle: 'var2', libelle: libelle(b.variable2Label, 'Seconde valeur'), exemple: '' },
  ].filter(Boolean)
}
const texteBadge = (choix) => {
  const b = badgesParId.value.get(choix.badge)
  if (!b) return ''
  return b.text.replace(/\{var1\}/g, choix.var1 || '…').replace(/\{var2\}/g, choix.var2 || '…')
}

const page = ref(null)
const payload = ref(portagePage.vide())
const erreur = ref('')
const message = ref(null)
const soumission = ref(false)
const conflit = ref(false)
const apercuMobile = ref(false)
const format = ref('ordinateur')

// --- Sections ---------------------------------------------------------------
//
// Chaque section du formulaire : sa carte, sa couleur (palette Odysway), son
// entrée au sommaire, et ce qui la dit « remplie » pour la progression.

const sections = computed(() => {
  const p = payload.value
  const s = (numero, id, court, titre, sousTitre, icone, couleur, complete, requis = false) =>
    ({ numero, id: `section-${id}`, court, titre, sousTitre, icone, couleur, complete: Boolean(complete), requis })
  return {
    essentiel: s(1, 'essentiel', 'L\'essentiel', 'L\'essentiel', 'Le titre, l\'accroche et les repères du séjour : durée, prix, niveau, badges.',
      mdiCompassOutline, '#DB6644', p.titre && p.accroche, true),
    photos: s(2, 'photos', 'Photos', 'Photos et vidéos', 'Une grande photo horizontale pour l\'en-tête, une seconde à ses côtés (sur ordinateur), puis une galerie.',
      mdiImageMultipleOutline, '#E29A1F', p.image && p.galerie.length, true),
    equipe: s(3, 'equipe', 'Équipe', 'Vous et votre équipe', 'Qui accompagne le groupe. Votre nom, votre rôle et votre photo signent aussi votre mot.',
      mdiAccountGroupOutline, '#237C8C', p.accompagnateur.nom && p.accompagnateur.photo),
    mot: s(4, 'mot', 'Votre mot', 'Votre mot sur le séjour', `La note de l'auteur, en haut de la page (« ${titresPage.value.mot} »).`,
      mdiFeather, '#7D9676', p.mot, true),
    pointsForts: s(5, 'points-forts', 'Points forts', titresPage.value.pointsForts, 'Les temps forts du séjour, présentés en liste cochée sous votre mot.',
      mdiHeartOutline, '#E29A1F', p.pointsForts.length),
    programme: s(6, 'programme', 'Programme', 'Programme jour par jour', 'Une carte par jour (ou par groupe de jours) : déroulé, trajet, nuit, photo.',
      mdiMapMarkerPath, '#3D7B8A', p.programme.some(j => j.titre || j.texte), true),
    hebergement: s(7, 'hebergement', 'Hébergement', 'Hébergement', 'Où dort le groupe : l\'ambiance, les chambres, les repas, quelques photos.',
      mdiHomeVariantOutline, '#2D5843', p.hebergements.length),
    inclus: s(8, 'inclus', 'Inclus', 'Ce qui est inclus, ou non', 'Pour que chacun sache ce que comprend le prix.',
      mdiCheckDecagramOutline, '#237C8C', p.inclus.length || p.nonInclus.length),
    faq: s(9, 'faq', 'FAQ', 'Questions fréquentes', 'Les questions que l\'on vous pose souvent : niveau, matériel, voyager seul…',
      mdiChatQuestionOutline, '#DB6644', p.faq.length),
  }
})
const progression = computed(() => {
  const liste = Object.values(sections.value)
  const remplies = liste.filter(x => x.complete).length
  return { remplies, total: liste.length, pourcentage: Math.round((remplies / liste.length) * 100) }
})
const manquants = computed(() => portagePage.manques(payload.value))
const allerA = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// --- Chargement ------------------------------------------------------------

const inclusTexte = ref('')
const nonInclusTexte = ref('')
const pointsFortsTexte = ref('')
const videosTexte = ref('')
// Le texte reste tel que tapé (lignes vides comprises) ; le brouillon ne garde
// que les lignes remplies.
const lignes = t => t.split('\n').map(l => l.trim()).filter(Boolean)
watch(inclusTexte, (t) => {
  payload.value.inclus = lignes(t)
})
watch(nonInclusTexte, (t) => {
  payload.value.nonInclus = lignes(t)
})
watch(pointsFortsTexte, (t) => {
  payload.value.pointsForts = lignes(t)
})
// Les liens sont gardés sous leur forme d'intégration ; ceux qui ne sont ni
// YouTube ni Vimeo sont signalés, pas enregistrés.
const videosRefusees = computed(() => lignes(videosTexte.value).filter(l => !portagePage.lienVideo(l)))
watch(videosTexte, (t) => {
  payload.value.videos = lignes(t).map(portagePage.lienVideo).filter(Boolean)
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
  pointsFortsTexte.value = vue.payload.pointsForts.join('\n')
  videosTexte.value = vue.payload.videos.join('\n')
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
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(43, 76, 82, 0.08);
}
.editeur-marque {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  letter-spacing: -0.01em;
}
.editeur-corps {
  display: flex;
}
/* Le constructeur : fond chaud, halos aux couleurs d'Odysway (terracotta,
   jaune, bleu canard) et fin semis de points, sous des cartes blanches. */
.editeur-formulaire {
  flex: 1 1 520px;
  max-width: 720px;
  min-width: 0;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(520px 380px at 0% 0%, rgba(219, 102, 68, 0.16), transparent 70%),
    radial-gradient(460px 420px at 100% 18%, rgba(240, 179, 72, 0.18), transparent 70%),
    radial-gradient(560px 520px at 10% 62%, rgba(35, 124, 140, 0.12), transparent 70%),
    radial-gradient(520px 460px at 100% 92%, rgba(125, 150, 118, 0.16), transparent 70%),
    linear-gradient(180deg, #FDF6F2 0%, #FBF0EC 45%, #F1F4F4 100%);
}
.editeur-formulaire::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: radial-gradient(rgba(43, 76, 82, 0.09) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 35%, transparent 65%, #000 100%);
  pointer-events: none;
}

.editeur-bandeau {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 28px 26px 24px;
  color: #fff;
  background: linear-gradient(135deg, #2B4C52 0%, #237C8C 70%, #3D7B8A 100%);
  box-shadow: 0 18px 40px -22px rgba(43, 76, 82, 0.7);
}
.editeur-bandeau-contenu {
  position: relative;
  z-index: 1;
}
.editeur-bandeau-sur {
  letter-spacing: 0.1em;
  color: #F0B348;
}
.editeur-bandeau-texte {
  color: rgba(255, 255, 255, 0.82);
}

.editeur-sommaire {
  position: sticky;
  top: 57px;
  z-index: 4;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -16px;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(253, 246, 242, 0.96) 70%, rgba(253, 246, 242, 0));
}
@media (min-width: 960px) {
  .editeur-sommaire {
    margin: 0 -24px;
    padding: 10px 24px;
  }
}
.editeur-sommaire::-webkit-scrollbar {
  display: none;
}
.editeur-sommaire-lien {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: #fff;
  border: 1px solid rgba(43, 76, 82, 0.1);
  box-shadow: 0 1px 2px rgba(43, 76, 82, 0.06);
  transition: border-color 0.15s, transform 0.15s;
}
.editeur-sommaire-lien .v-icon {
  color: var(--accent);
}
.editeur-sommaire-lien:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}
.editeur-sommaire-lien:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.editeur-sommaire-lien--rempli .v-icon {
  color: rgb(var(--v-theme-success));
}

/* Éléments répétés (jours, hébergements, questions…) : carte teintée, champs blancs. */
.carte-element {
  background: #F6F8F8 !important;
  border: 1px solid rgba(43, 76, 82, 0.07);
}
.carte-element :deep(.v-field) {
  background: #fff;
}
.bouton-ajout {
  border-style: dashed;
  border-width: 1.5px;
  border-radius: 14px;
  width: 100%;
  height: 48px !important;
  background: rgba(43, 76, 82, 0.025);
  letter-spacing: 0;
  text-transform: none;
}

.editeur-fin {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px dashed rgba(219, 102, 68, 0.35);
  margin-bottom: 48px;
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
