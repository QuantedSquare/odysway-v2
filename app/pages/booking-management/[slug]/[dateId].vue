<template>
  <div>
    <div
      v-if="loading"
      class="d-flex justify-center align-center"
      style="min-height: 60vh;"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="40"
      />
    </div>

    <template v-else>
      <BoPageHeader
        :crumbs="[
          { title: 'Backoffice', to: '/booking-management' },
          { title: 'Voyages', to: '/booking-management' },
          { title: voyageTitle || form.travel_slug, to: `/booking-management/${slug}` },
          { title: dayjs(form.departure_date).format('DD MMM YYYY') },
        ]"
      >
        <template #title>
          {{ voyageTitle || form.travel_slug }} —
          <span class="bo-num">
            {{ dayjs(form.departure_date).format('DD') }} → {{ dayjs(form.return_date).format('DD MMM YYYY') }}
          </span>
        </template>

        <template #meta>
          <span
            v-if="form.deleted"
            class="bo-tag bo-tag--crit"
          >Supprimée</span>
          <span
            v-else
            class="bo-tag"
            :class="form.published ? 'bo-tag--ok' : 'bo-tag--warn'"
          >
            <span class="bo-dot" />{{ form.published ? 'Publiée' : 'Non publiée' }}
          </span>
          <span
            v-if="form.is_indiv_travel"
            class="bo-tag bo-tag--info"
          >Individuel</span>
          <BookingDateActivityLog
            :slug="slug"
            :date-id="dateId"
            :fallback-updated-at="form.updated_at"
            :fallback-last-editor="form.last_editor"
          />
        </template>

        <template #actions>
          <v-btn
            variant="text"
            @click="onCancel"
          >
            Retour
          </v-btn>
          <v-btn
            :prepend-icon="mdiContentDuplicate"
            @click="openDuplicateDialog"
          >
            Dupliquer un deal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="form.deleted"
            @click="onSave"
          >
            Enregistrer
          </v-btn>
        </template>
      </BoPageHeader>

      <div class="bo-well">
        <!-- Date supprimée : tout est en lecture seule tant qu'elle ne l'est pas -->
        <div
          v-if="form.deleted"
          class="bo-notice bo-notice--crit"
        >
          <v-icon :icon="mdiDelete" />
          <div class="bo-notice__body">
            <div class="bo-notice__title">
              Cette date est supprimée.
            </div>
            <div class="bo-notice__meta">
              Supprimée le
              {{ form.deleted_at ? dayjs(form.deleted_at).format('DD/MM/YYYY à HH:mm') : '?' }}
              par {{ form.deleted_by || '?' }}. Elle n'apparaît plus sur le site ni dans les
              compteurs, et les modifications sont désactivées.
            </div>
          </div>
          <div class="bo-notice__actions">
            <v-btn
              color="error"
              variant="flat"
              :prepend-icon="mdiRestore"
              @click="restoreDate"
            >
              Restaurer la date
            </v-btn>
          </div>
        </div>

        <!-- Réservations orphelines (deal AC sans email) -->
        <div
          v-if="orphanTravelers.length"
          class="bo-notice bo-notice--warn"
        >
          <v-icon :icon="mdiAlertOutline" />
          <div class="bo-notice__body">
            <div class="bo-notice__title">
              {{ orphanTravelers.length }} réservation(s) sans email côté ActiveCampaign.
            </div>
            <div class="bo-notice__meta">
              Elles ne sont plus supprimées automatiquement. Vérifiez le deal avant de les retirer.
            </div>
          </div>
        </div>

        <!-- Dossier de départ -->
        <div
          v-if="form.departure_id"
          class="bo-notice bo-notice--ok"
        >
          <v-icon :icon="mdiAirplaneTakeoff" />
          <div class="bo-notice__body">
            <span class="bo-notice__title">Dossier de départ lié</span>
            <span class="bo-notice__meta bo-num ml-2">AC #{{ form.departure_id }}</span>
          </div>
          <div class="bo-notice__actions">
            <v-btn
              :href="`https://odysway90522.activehosted.com/app/deals/${form.departure_id}`"
              target="_blank"
            >
              Ouvrir dans ActiveCampaign ↗
            </v-btn>
            <v-btn
              :icon="mdiClose"
              variant="text"
              density="comfortable"
              color="error"
              aria-label="Détacher le dossier de départ"
              :loading="removingDepartureDeal"
              @click="onRemoveDepartureDeal"
            />
          </div>
        </div>

        <div
          v-else
          class="bo-notice bo-notice--warn"
        >
          <v-icon :icon="mdiAirplaneTakeoff" />
          <div class="bo-notice__body">
            <span class="bo-notice__title">Aucun dossier de départ assigné</span>
          </div>
          <div class="bo-notice__actions">
            <v-btn @click="departureDialog = true">
              Assigner un dossier
            </v-btn>
          </div>
        </div>

        <v-tabs
          v-model="selectedTab"
          class="align-self-start"
        >
          <v-tab value="general">
            Paramètres
          </v-tab>
          <v-tab value="margins">
            Marges et documents
          </v-tab>
        </v-tabs>

        <v-window v-model="selectedTab">
          <v-window-item value="general">
            <div class="bo-split">
              <!-- Colonne principale -->
              <div class="bo-stack">
                <v-form @submit.prevent="onSave">
                  <DateFormCard
                    v-model="form"
                    :status-options="statuses"
                    :allow-individual="!isCustomTravel"
                    title="Paramètres de la date"
                    subtitle="Paramètres de la date"
                    :readonly-booked-seat="true"
                  >
                    <template #travel>
                      <v-text-field
                        :model-value="form.travel_slug"
                        label="Slug du voyage"
                        readonly
                        style="max-width: 360px;"
                      />
                    </template>
                    <template #actions>
                      <v-btn
                        variant="text"
                        @click="onCancel"
                      >
                        Annuler
                      </v-btn>
                      <v-btn
                        color="primary"
                        variant="flat"
                        type="submit"
                        :loading="saving"
                        :disabled="form.deleted"
                      >
                        Enregistrer
                      </v-btn>
                    </template>
                  </DateFormCard>
                </v-form>

                <!-- Voyageurs -->
                <section class="bo-card">
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Voyageurs
                    </h2>
                    <span class="bo-tag bo-tag--accent bo-num">
                      {{ form.booked_seat || 0 }} / {{ form.max_travelers || '?' }}
                    </span>
                    <v-spacer />
                    <v-btn @click="assignDialog = true">
                      Assigner un deal AC
                    </v-btn>
                  </div>

                  <div
                    v-if="!bookedTravelers.length"
                    class="bo-empty"
                  >
                    Aucun voyageur inscrit sur cette date.
                  </div>

                  <div
                    v-else
                    class="bo-people"
                  >
                    <div
                      v-for="traveler in bookedTravelers"
                      :key="traveler.id"
                      class="bo-people__row"
                    >
                      <span class="bo-people__av">
                        {{ initial(traveler) }}
                      </span>
                      <div class="bo-people__id">
                        <div class="bo-people__name">
                          <NuxtLink
                            :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                            target="_blank"
                            class="text-decoration-none"
                          >
                            {{ traveler.name?.trim() ? traveler.name : traveler.email }} ↗
                          </NuxtLink>
                          <span
                            v-if="traveler.booked_places > 1"
                            class="bo-hint ml-1"
                          >
                            × {{ traveler.booked_places }}
                          </span>
                        </div>
                        <div class="bo-people__mail">
                          {{ traveler.name?.trim() && traveler.email ? traveler.email : `Deal #${traveler.deal_id}` }}
                        </div>
                      </div>

                      <span
                        v-if="traveler.orphan"
                        class="bo-tag bo-tag--crit"
                      >Orphelin</span>
                      <span
                        v-else-if="traveler.is_option"
                        class="bo-tag bo-tag--info"
                      >
                        Option {{ dayjs(traveler.expiracy_date).format('DD/MM') }}
                      </span>
                      <span
                        v-else-if="traveler.restToPay > 0"
                        class="bo-tag bo-tag--warn"
                      >Acompte</span>
                      <span
                        v-else
                        class="bo-tag bo-tag--ok"
                      >Soldé</span>

                      <div class="bo-people__amt">
                        {{ formatNumber(traveler.alreadyPaid) }} €
                        <span
                          v-if="traveler.restToPay > 0"
                          class="bo-due"
                        >reste {{ formatNumber(traveler.restToPay) }} €</span>
                      </div>

                      <v-menu
                        v-model="rowMenuId[traveler.id]"
                        :close-on-content-click="false"
                      >
                        <template #activator="{ props: menuProps }">
                          <v-btn
                            v-bind="menuProps"
                            :icon="mdiDotsVertical"
                            variant="text"
                            density="comfortable"
                            :aria-label="`Actions pour ${traveler.name || traveler.email}`"
                          />
                        </template>
                        <v-list>
                          <v-list-item
                            :prepend-icon="mdiLinkEdit"
                            title="Lien de paiement"
                            @click="rowMenuId[traveler.id] = false; openPaymentDialog(traveler)"
                          />
                          <v-list-item
                            v-if="traveler.is_option"
                            :prepend-icon="mdiClockPlusOutline"
                            title="Prolonger l'option"
                            @click="rowMenuId[traveler.id] = false; openExtendDialog(traveler)"
                          />
                          <v-list-item
                            :prepend-icon="mdiDelete"
                            title="Supprimer"
                            class="text-error"
                            @click="rowMenuId[traveler.id] = false; deleteTraveler(traveler.id)"
                          />
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </section>

                <!-- Prospects -->
                <section
                  v-if="prospectTravelers.length"
                  class="bo-card"
                >
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Prospects en attente
                    </h2>
                    <span class="bo-tag bo-num">{{ prospectTravelers.length }}</span>
                  </div>
                  <div class="bo-people">
                    <div
                      v-for="traveler in prospectTravelers"
                      :key="traveler.id"
                      class="bo-people__row"
                    >
                      <span class="bo-people__av">{{ initial(traveler) }}</span>
                      <div class="bo-people__id">
                        <div class="bo-people__name">
                          <NuxtLink
                            :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                            target="_blank"
                            class="text-decoration-none"
                          >
                            {{ traveler.email || 'Deal AC supprimé' }} ↗
                          </NuxtLink>
                        </div>
                        <div class="bo-people__mail">
                          Deal #{{ traveler.deal_id }}
                        </div>
                      </div>
                      <span
                        v-if="!traveler.email"
                        class="bo-tag bo-tag--crit"
                      >Sans email</span>

                      <v-btn
                        v-if="traveler.email"
                        :prepend-icon="mdiCalendarOutline"
                        :loading="placingOptionId === traveler.id"
                        @click="placeOptionOnProspect(traveler)"
                      >
                        Poser une option
                      </v-btn>
                      <v-btn
                        v-if="traveler.email"
                        :icon="mdiLinkEdit"
                        variant="text"
                        density="comfortable"
                        aria-label="Lien de paiement"
                        @click="openPaymentDialog(traveler)"
                      />
                      <v-btn
                        :icon="mdiDelete"
                        variant="text"
                        density="comfortable"
                        color="error"
                        aria-label="Supprimer ce prospect"
                        @click="deleteTraveler(traveler.id)"
                      />
                    </div>
                  </div>
                </section>

                <!-- Réservations supprimées -->
                <section
                  v-if="deletedTravelers.length"
                  class="bo-card"
                >
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Voyageurs supprimés
                    </h2>
                    <span class="bo-tag bo-num">{{ deletedTravelers.length }}</span>
                    <v-spacer />
                    <v-btn
                      variant="text"
                      @click="showDeletedTravelers = !showDeletedTravelers"
                    >
                      {{ showDeletedTravelers ? 'Masquer' : 'Afficher' }}
                    </v-btn>
                  </div>
                  <div
                    v-if="showDeletedTravelers"
                    class="bo-people"
                  >
                    <div
                      v-for="traveler in deletedTravelers"
                      :key="traveler.id"
                      class="bo-people__row"
                    >
                      <span class="bo-people__av">{{ initial(traveler) }}</span>
                      <div class="bo-people__id">
                        <div class="bo-people__name">
                          {{ traveler.name || traveler.email || `Deal ${traveler.deal_id}` }}
                        </div>
                        <div class="bo-people__mail">
                          {{ deletedTravelerTooltip(traveler) }} · {{ traveler.booked_places }} place(s)
                        </div>
                      </div>
                      <v-btn
                        :prepend-icon="mdiRestore"
                        @click="restoreTraveler(traveler.id)"
                      >
                        Restaurer
                      </v-btn>
                    </div>
                  </div>
                </section>

                <DateNotes
                  :slug="slug"
                  :date-id="dateId"
                />
              </div>

              <!-- Colonne latérale -->
              <div class="bo-stack">
                <section class="bo-card">
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Encaissement
                    </h2>
                  </div>
                  <div class="bo-card__body">
                    <div class="bo-money">
                      <div>
                        <div class="bo-money__k">
                          Total payé
                        </div>
                        <div class="bo-money__v bo-money__v--ok">
                          {{ formatNumber(totalPaid) }} €
                        </div>
                      </div>
                      <div>
                        <div class="bo-money__k">
                          Reste à encaisser
                        </div>
                        <div class="bo-money__v bo-money__v--warn">
                          {{ formatNumber(totalRestToPay) }} €
                        </div>
                      </div>
                    </div>

                    <div
                      class="bo-progress"
                      role="img"
                      :aria-label="`${paidRatio} % encaissé`"
                    >
                      <i
                        class="bo-progress__paid"
                        :style="{ width: `${paidRatio}%` }"
                      />
                      <i
                        class="bo-progress__due"
                        :style="{ width: `${100 - paidRatio}%` }"
                      />
                    </div>
                    <div class="bo-legend">
                      <span><i style="background: var(--bo-ok);" />Payé {{ paidRatio }} %</span>
                      <span><i style="background: color-mix(in srgb, var(--bo-warn) 45%, transparent);" />Dû {{ 100 - paidRatio }} %</span>
                    </div>

                    <div class="bo-section">
                      <div class="bo-kv">
                        <span class="bo-money__k">Valeur totale</span>
                        <span class="bo-kv__v">{{ formatNumber(totalValue) }} €</span>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Lien funnel -->
                <section class="bo-card">
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Lien funnel
                    </h2>
                    <v-spacer />
                    <v-select
                      v-model="funnelLinkType"
                      :items="funnelLinkTypes"
                      item-title="label"
                      item-value="value"
                      aria-label="Type de lien funnel"
                      style="max-width: 130px;"
                    />
                  </div>
                  <div class="bo-card__body">
                    <v-text-field
                      :model-value="funnelLink"
                      readonly
                      aria-label="Lien funnel"
                      class="mb-2"
                    />
                    <v-btn
                      block
                      :prepend-icon="mdiContentCopy"
                      @click="copyFunnelLink"
                    >
                      Copier le lien
                    </v-btn>
                  </div>
                </section>

                <!-- Activité -->
                <section class="bo-card">
                  <div class="bo-card__head">
                    <h2 class="bo-card__title">
                      Activité
                    </h2>
                  </div>
                  <BookingDateActivityLog
                    :slug="slug"
                    :date-id="dateId"
                    :fallback-updated-at="form.updated_at"
                    :fallback-last-editor="form.last_editor"
                    variant="panel"
                  />
                </section>
              </div>
            </div>

            <!--
              Hors de la grille à deux colonnes, sur toute la largeur : la carte
              du site vitrine est dimensionnée pour une pleine largeur de page.
              L'aperçu doit reproduire la grande carte des pages voyage à
              l'identique, donc on ne lui applique aucun style propre.
            -->
            <section class="bo-card mt-5">
              <div class="bo-card__head">
                <h2 class="bo-card__title">
                  Prévisualisation
                </h2>
                <span class="bo-hint">Rendu sur le site public, avec les valeurs affichées</span>
                <v-spacer />
                <span
                  class="bo-tag"
                  :class="form.published && !form.is_indiv_travel ? 'bo-tag--ok' : 'bo-tag--warn'"
                >
                  {{ form.is_indiv_travel ? 'Individuel' : form.published ? 'Publiée' : 'Non publiée' }}
                </span>
              </div>
              <div class="bo-preview">
                <v-theme-provider theme="odysway">
                  <DatesPricesItem :date="previewDate" />
                </v-theme-provider>
              </div>
            </section>
          </v-window-item>

          <v-window-item value="margins">
            <div class="bo-stack">
              <DateMarginCard
                ref="marginCard"
                :slug="slug"
                :date-id="dateId"
              />
              <DateInvoices
                :slug="slug"
                :date-id="dateId"
                @invoices-changed="marginCard?.refresh()"
              />
              <DateAttachments
                :slug="slug"
                :date-id="dateId"
              />
            </div>
          </v-window-item>
        </v-window>
      </div>

      <!-- Assigner un deal AC -->
      <v-dialog
        v-model="assignDialog"
        max-width="460"
      >
        <v-card>
          <v-card-title>Assigner un deal ActiveCampaign</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onAssignDeal">
              <v-text-field
                v-model="dealUrl"
                label="URL du deal AC"
                placeholder="https://odysway90522.activehosted.com/app/deals/123"
                class="mb-3"
              />
              <v-switch
                v-model="assignWithOption"
                label="Poser une option (7 jours)"
                hide-details
              />
              <div
                v-if="assignDealError"
                class="bo-notice bo-notice--crit mt-3"
              >
                <div class="bo-notice__body">
                  <NuxtLink
                    v-if="assignDealError.includes('/booking-management/')"
                    :to="assignDealError"
                  >
                    Ce deal est déjà assigné à une autre date — l'ouvrir →
                  </NuxtLink>
                  <span v-else>{{ assignDealError }}</span>
                </div>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              @click="assignDialog = false"
            >
              Fermer
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="assigningDeal"
              :disabled="!dealUrl"
              @click="onAssignDeal"
            >
              Assigner
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Assigner un dossier de départ -->
      <v-dialog
        v-model="departureDialog"
        max-width="460"
      >
        <v-card>
          <v-card-title>Assigner un dossier de départ</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="departureDealUrl"
              label="URL du deal AC (dossier de départ)"
              placeholder="https://odysway90522.activehosted.com/app/deals/123"
            />
            <div
              v-if="assignDepartureDealError"
              class="bo-notice bo-notice--crit mt-3"
            >
              <div class="bo-notice__body">
                {{ assignDepartureDealError }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              @click="departureDialog = false"
            >
              Fermer
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="assigningDepartureDeal"
              :disabled="!departureDealUrl"
              @click="onAssignDepartureDeal"
            >
              Assigner
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Prolonger une option -->
      <v-dialog
        v-model="extendDialog"
        max-width="380"
      >
        <v-card v-if="extendTarget">
          <v-card-title>Prolonger l'option</v-card-title>
          <v-card-text>
            <p class="bo-hint mb-3">
              Ajoute des jours à partir de la date d'expiration actuelle
              ({{ dayjs(extendTarget.expiracy_date).format('DD/MM/YYYY') }}).
            </p>
            <div class="bo-row mb-3">
              <v-btn
                v-for="preset in [3, 7, 14]"
                :key="preset"
                :loading="extendingOptionId === extendTarget.id"
                @click="extendOption(extendTarget, preset)"
              >
                +{{ preset }} jours
              </v-btn>
            </div>
            <div class="bo-row">
              <v-text-field
                v-model.number="extendCustomDays"
                type="number"
                min="1"
                max="90"
                label="Jours"
                style="max-width: 110px;"
              />
              <v-btn
                color="primary"
                variant="flat"
                :loading="extendingOptionId === extendTarget.id"
                :disabled="!extendCustomDays || extendCustomDays < 1 || extendCustomDays > 90"
                @click="extendOption(extendTarget, extendCustomDays)"
              >
                Appliquer
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Lien de paiement -->
      <v-dialog
        v-model="paymentDialog"
        max-width="460"
      >
        <v-card v-if="selectedTraveler">
          <v-card-title>Lien de paiement</v-card-title>
          <v-card-text>
            <div class="bo-people__row mb-3 px-0">
              <span class="bo-people__av">{{ initial(selectedTraveler) }}</span>
              <div class="bo-people__id">
                <div class="bo-people__name">
                  {{ selectedTraveler.name?.trim() ? selectedTraveler.name : selectedTraveler.email }}
                </div>
                <div
                  v-if="selectedTraveler.name?.trim() && selectedTraveler.email"
                  class="bo-people__mail"
                >
                  {{ selectedTraveler.email }}
                </div>
              </div>
            </div>

            <v-select
              v-model="paymentType"
              :items="paymentTypes"
              label="Type de paiement"
              item-title="label"
              item-value="value"
              :hint="paymentTypeHints[paymentType]"
              persistent-hint
              class="mb-3"
            />
            <v-text-field
              v-if="paymentType === 'custom'"
              v-model="customAmount"
              label="Montant personnalisé"
              suffix="€"
              type="number"
              autofocus
              class="mb-3"
            />

            <p class="bo-eyebrow mt-4">
              Lien à transmettre
            </p>
            <v-text-field
              :model-value="generatedLink"
              readonly
              aria-label="Lien de paiement"
              :placeholder="paymentType === 'custom' && !customAmount ? 'Saisissez un montant pour générer le lien' : ''"
              :disabled="!generatedLink"
              class="mb-3"
            />
            <v-btn
              block
              :prepend-icon="mdiContentCopy"
              :disabled="!generatedLink"
              @click="copyLink"
            >
              Copier le lien
            </v-btn>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              @click="closePaymentDialog"
            >
              Fermer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dupliquer un deal -->
      <v-dialog
        v-model="duplicateDialog"
        max-width="480"
      >
        <v-card>
          <v-card-title>Dupliquer un deal</v-card-title>
          <v-card-text>
            <p class="bo-hint mb-4">
              Clone un deal ActiveCampaign existant sur un email de test, puis l'assigne à
              cette date pour générer une nouvelle réservation et des liens (BMS + paiement)
              valides. Le deal source n'est pas modifié.
            </p>

            <v-text-field
              v-model="duplicateDealUrl"
              label="URL du deal AC à dupliquer"
              placeholder="https://odysway90522.activehosted.com/app/deals/123"
              :prepend-inner-icon="mdiLinkVariant"
              class="mb-3"
            />
            <v-text-field
              v-model="duplicateEmail"
              label="Email de test"
              placeholder="test@odysway.com"
              type="email"
              :prepend-inner-icon="mdiEmailOutline"
              class="mb-3"
            />
            <div class="bo-grid-2">
              <v-text-field
                v-model="duplicateFirstname"
                label="Prénom (optionnel)"
              />
              <v-text-field
                v-model="duplicateLastname"
                label="Nom (optionnel)"
              />
            </div>

            <div
              v-if="duplicateError"
              class="bo-notice bo-notice--crit mt-3"
            >
              <div class="bo-notice__body">
                {{ duplicateError }}
              </div>
            </div>
            <div
              v-if="duplicatedDealId"
              class="bo-notice bo-notice--ok mt-3"
            >
              <div class="bo-notice__body">
                Deal dupliqué et assigné à cette date.
              </div>
              <div class="bo-notice__actions">
                <v-btn
                  :href="`https://odysway90522.activehosted.com/app/deals/${duplicatedDealId}`"
                  target="_blank"
                >
                  Ouvrir #{{ duplicatedDealId }} ↗
                </v-btn>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              @click="duplicateDialog = false"
            >
              Fermer
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="duplicating"
              :disabled="!duplicateDealUrl || !duplicateEmail"
              @click="onDuplicateDeal"
            >
              Dupliquer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiDelete,
  mdiLinkEdit,
  mdiAirplaneTakeoff,
  mdiCalendarOutline,
  mdiContentCopy,
  mdiContentDuplicate,
  mdiLinkVariant,
  mdiEmailOutline,
  mdiClockPlusOutline,
  mdiRestore,
  mdiDotsVertical,
  mdiClose,
  mdiAlertOutline,
} from '@mdi/js'
import dayjs from 'dayjs'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import DateFormCard from '~/components/booking/DateFormCard.vue'
import DateAttachments from '~/components/booking/DateAttachments.vue'
import DateNotes from '~/components/booking/DateNotes.vue'
import DateMarginCard from '~/components/booking/DateMarginCard.vue'
import DateInvoices from '~/components/booking/DateInvoices.vue'
import { BOOKING_STATUSES } from '~/utils/bookingStatuses'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({ layout: 'booking', middleware: 'booking-management' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const sanity = useSanity()
const { confirmAction, toast } = useBoDialogs()

const slug = route.params.slug
const dateId = route.params.dateId

const form = ref({})
const bookedTravelers = ref([])
const prospectTravelers = ref([])
const deletedTravelers = ref([])
const orphanTravelers = ref([])
const showDeletedTravelers = ref(false)
const loading = ref(true)
const selectedTab = ref('general')
const marginCard = ref(null)
const rowMenuId = ref({})

const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
    title,
    availabilityTypes,
    pricing
  }`
const { data: voyagePricing } = await useAsyncData('voyagePricing', () =>
  sanity.fetch(voyageQuery, { slug }),
)

const saving = ref(false)
const statuses = BOOKING_STATUSES

const assignDialog = ref(false)
const dealUrl = ref('')
const assigningDeal = ref(false)
const assignDealError = ref('')
const assignWithOption = ref(false)
const placingOptionId = ref(null)

const extendDialog = ref(false)
const extendTarget = ref(null)
const extendingOptionId = ref(null)
const extendCustomDays = ref(7)

const departureDialog = ref(false)
const departureDealUrl = ref('')
const assigningDepartureDeal = ref(false)
const assignDepartureDealError = ref('')
const removingDepartureDeal = ref(false)

const duplicateDialog = ref(false)
const duplicateDealUrl = ref('')
const duplicateEmail = ref('')
const duplicateFirstname = ref('')
const duplicateLastname = ref('')
const duplicating = ref(false)
const duplicateError = ref('')
const duplicatedDealId = ref(null)

const paymentDialog = ref(false)
const selectedTraveler = ref(null)
const paymentType = ref('full')
const customAmount = ref('')
const paymentTypes = [
  { value: 'full', label: 'Faire payer entièrement' },
  { value: 'deposit', label: 'Paiement de l\'acompte' },
  { value: 'custom', label: 'Paiement custom' },
  { value: 'balance', label: 'Paiement du solde' },
]
const paymentTypeHints = {
  full: 'Le voyageur paiera l\'intégralité du voyage.',
  deposit: 'Paiement de l\'acompte (30% + assurance).',
  balance: 'Paiement du solde restant dû.',
  custom: 'Vous définissez un montant libre à payer.',
}
const generatedLink = computed(() => {
  if (!selectedTraveler.value) return ''
  if (paymentType.value === 'custom' && !customAmount.value) return ''
  const amountParam = paymentType.value === 'custom' ? `&amount=${customAmount.value}` : ''
  return `${config.public.siteURL}/checkout?booked_id=${selectedTraveler.value.id}&type=${paymentType.value}${amountParam}`
})

const funnelLinkType = ref('deposit')
const funnelLinkTypes = [
  { value: 'deposit', label: 'Acompte' },
  { value: 'full', label: 'Total' },
]
const funnelLink = computed(() => {
  if (!form.value.id) return ''
  return `${config.public.siteURL}/checkout?date_id=${form.value.id}&type=${funnelLinkType.value}${funnelLinkType.value === 'deposit' ? `&step=1&voyage=${form.value.travel_slug}` : ''}`
})

const voyageTitle = computed(() => voyagePricing.value?.title)
const isCustomTravel = computed(() => voyagePricing.value?.availabilityTypes?.includes('custom'))

const previewDate = computed(() => ({
  ...form.value,
  lastMinutePrice: voyagePricing.value?.pricing?.lastMinuteReduction || 0,
  earlyBirdPrice: voyagePricing.value?.pricing?.earlyBirdReduction || 0,
}))

const totalPaid = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.alreadyPaid, 0))
const totalRestToPay = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.restToPay, 0))
const totalValue = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.price, 0))
const paidRatio = computed(() => {
  const total = totalPaid.value + totalRestToPay.value
  if (!total) return 0
  return Math.round((totalPaid.value / total) * 100)
})

// Pas de formateur local ici : `formatNumber` est le utilitaire auto-importé de
// ~/utils/formatNumber, qui convertit les centimes en euros. Le redéfinir ici
// masquait l'auto-import et affichait les montants ×100.

const initial = traveler =>
  (traveler.name?.trim() ? traveler.name : traveler.email || '?').slice(0, 1).toUpperCase()

const fetchDetails = async () => {
  try {
    // includeDeleted : la fiche doit pouvoir s'ouvrir sur une date supprimée
    // (bandeau + bouton Restaurer) et lister les voyageurs supprimés.
    const [date, travelers] = await Promise.all([
      bookingApi.getDateById(dateId, { includeDeleted: true }),
      bookingApi.getBooked(slug, dateId, { includeDeleted: true }),
    ])
    form.value = { ...date, index: 0, badges: date.badges || date.displayed_badges }
    const active = (travelers || []).filter(t => !t.deleted)
    bookedTravelers.value = active.filter(traveler => traveler.booked_places > 0)
    prospectTravelers.value = active.filter(traveler => traveler.booked_places === 0)
    deletedTravelers.value = (travelers || []).filter(t => t.deleted)
    orphanTravelers.value = active.filter(t => t.orphan)
  }
  finally {
    loading.value = false
  }
}

const restoreDate = async () => {
  const ok = await confirmAction({
    title: 'Restaurer cette date ?',
    message: 'Les éléments supprimés en même temps qu\'elle seront restaurés aussi.',
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

  try {
    const res = await bookingApi.restoreDate(slug, dateId)
    const messages = []
    for (const c of res?.conflicts || []) {
      if (c.type === 'booking_reassigned') {
        messages.push(`Le deal ${c.deal_id} a été ré-assigné à une autre date depuis : il n'a pas été restauré ici.`)
      }
      if (c.type === 'duplicate_active_date') {
        messages.push('Une date active existe déjà pour ce voyage au même départ — vérifiez les doublons.')
      }
    }
    if (res?.departureDealNeedsRecreation) {
      messages.push('Le dossier de départ avait été supprimé dans ActiveCampaign et n\'est pas récupérable : recréez-le ci-dessous.')
    }
    toast(messages.length ? messages.join('\n\n') : 'Date restaurée.', messages.length ? 'warn' : 'ok', messages.length ? 12000 : 5000)
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la restauration'), 'crit')
  }
}

const restoreTraveler = async (id) => {
  const ok = await confirmAction({
    title: 'Restaurer cette réservation ?',
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

  try {
    await bookingApi.restoreBooked(slug, dateId, id)
    toast('Réservation restaurée.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la restauration'), 'crit')
  }
}

const deletedTravelerTooltip = (t) => {
  const when = t.deleted_at ? dayjs(t.deleted_at).format('DD/MM/YYYY HH:mm') : 'date inconnue'
  return `Supprimée le ${when} par ${t.deleted_by || 'auteur inconnu'} (${t.deleted_reason || 'raison inconnue'})`
}

const onSave = async () => {
  saving.value = true
  try {
    await bookingApi.updateDate(slug, dateId, form.value)
    toast('Modifications enregistrées.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la sauvegarde.'), 'crit')
  }
  finally {
    saving.value = false
  }
}

const onCancel = () => {
  router.back()
}

const onAssignDeal = async () => {
  assignDealError.value = ''
  assigningDeal.value = true
  try {
    const match = dealUrl.value.match(/deals\/(\d+)$/)
    if (!match) {
      assignDealError.value = 'URL invalide.'
      assigningDeal.value = false
      return
    }
    const payload = { dealId: match[1] }
    if (assignWithOption.value) {
      payload.is_option = true
      payload.expiracy_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    await bookingApi.assignDeal(slug, dateId, payload)
    dealUrl.value = ''
    assignWithOption.value = false
    assignDialog.value = false
    toast('Deal assigné.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    const redirectTo = err?.data?.data?.redirectTo || err?.data?.redirectTo
    assignDealError.value = redirectTo || getApiErrorMessage(err, 'Erreur lors de l\'assignation.')
  }
  finally {
    assigningDeal.value = false
  }
}

const onRemoveDepartureDeal = async () => {
  const ok = await confirmAction({
    title: 'Détacher le dossier de départ ?',
    message: `Le deal AC #${form.value.departure_id} ne sera plus lié à cette date.`,
    confirmLabel: 'Détacher',
    tone: 'danger',
  })
  if (!ok) return

  removingDepartureDeal.value = true
  try {
    await bookingApi.removeDepartureDeal(slug, dateId)
    toast('Dossier de départ détaché.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la suppression du dossier de départ.'), 'crit')
  }
  finally {
    removingDepartureDeal.value = false
  }
}

const onAssignDepartureDeal = async () => {
  assignDepartureDealError.value = ''
  assigningDepartureDeal.value = true
  try {
    const match = departureDealUrl.value.match(/deals\/(\d+)$/)
    if (!match) {
      assignDepartureDealError.value = 'URL invalide.'
      assigningDepartureDeal.value = false
      return
    }
    await bookingApi.assignDepartureDeal(slug, dateId, { dealId: match[1] })
    departureDealUrl.value = ''
    departureDialog.value = false
    toast('Dossier de départ assigné.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    assignDepartureDealError.value = getApiErrorMessage(err, 'Erreur lors de l\'assignation du dossier de départ.')
  }
  finally {
    assigningDepartureDeal.value = false
  }
}

function openDuplicateDialog() {
  duplicateError.value = ''
  duplicatedDealId.value = null
  duplicateDialog.value = true
}

const onDuplicateDeal = async () => {
  duplicateError.value = ''
  duplicatedDealId.value = null
  const match = duplicateDealUrl.value.match(/deals\/(\d+)/)
  if (!match) {
    duplicateError.value = 'URL de deal invalide.'
    return
  }
  duplicating.value = true
  try {
    const { dealId: newDealId } = await bookingApi.duplicateDeal(match[1], {
      email: duplicateEmail.value.trim(),
      firstname: duplicateFirstname.value.trim(),
      lastname: duplicateLastname.value.trim(),
    })
    duplicatedDealId.value = newDealId
    // Assign the copy to the current date: creates a booked_date and regenerates
    // fresh linkBms + paiementLink from the new booked_id (valid, test-ready links).
    try {
      await bookingApi.assignDeal(slug, dateId, { dealId: newDealId })
      await fetchDetails()
    }
    catch (assignErr) {
      duplicateError.value = `Deal dupliqué (#${newDealId}) mais l'assignation à cette date a échoué : ${getApiErrorMessage(assignErr, 'erreur inconnue')}. Assignez-le manuellement.`
    }
  }
  catch (err) {
    duplicateError.value = getApiErrorMessage(err, 'Erreur lors de la duplication du deal.')
  }
  finally {
    duplicating.value = false
  }
}

const deleteTraveler = async (id) => {
  const ok = await confirmAction({
    title: 'Supprimer ce voyageur ?',
    message: 'La réservation sera masquée et restera restaurable.',
    confirmLabel: 'Supprimer',
    tone: 'danger',
  })
  if (!ok) return

  // Sans ce try/catch, toute erreur serveur remontait en rejet non géré : la
  // liste n'était pas rafraîchie et l'utilisateur voyait un no-op silencieux.
  try {
    await bookingApi.deleteBooked(slug, dateId, id)
    toast('Réservation masquée.', 'ok')
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la suppression du voyageur'), 'crit')
  }
  await fetchDetails()
}

const placeOptionOnProspect = async (traveler) => {
  const ok = await confirmAction({
    title: 'Poser une option ?',
    message: `Une option sera posée pour ${traveler.name || traveler.email}.`,
    confirmLabel: 'Poser l\'option',
  })
  if (!ok) return

  placingOptionId.value = traveler.id
  try {
    await bookingApi.placeOption({ id: traveler.id, booked_places: +traveler.nbTravelers || 1 })
    await $fetch(`/api/v1/ac/deals/update-with-bms?bookedId=${traveler.id}`, {
      method: 'POST',
      body: { stage: '27', currentStep: 'A posé une option' },
    })
    toast('Option posée.', 'ok')
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la pose d\'option.'), 'crit')
  }
  finally {
    placingOptionId.value = null
  }
}

function openExtendDialog(traveler) {
  extendTarget.value = traveler
  extendCustomDays.value = 7
  extendDialog.value = true
}

const extendOption = async (traveler, days) => {
  extendingOptionId.value = traveler.id
  try {
    await bookingApi.extendOption({ id: traveler.id, days })
    extendDialog.value = false
    toast(`Option prolongée de ${days} jours.`, 'ok')
    await fetchDetails()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la prolongation de l\'option.'), 'crit')
  }
  finally {
    extendingOptionId.value = null
  }
}

function openPaymentDialog(traveler) {
  selectedTraveler.value = traveler
  paymentType.value = 'full'
  customAmount.value = ''
  paymentDialog.value = true
}

function closePaymentDialog() {
  paymentDialog.value = false
  selectedTraveler.value = null
}

function copyLink() {
  if (generatedLink.value) {
    navigator.clipboard.writeText(generatedLink.value)
    toast('Lien copié.', 'ok', 2500)
  }
}

function copyFunnelLink() {
  if (funnelLink.value) {
    navigator.clipboard.writeText(funnelLink.value)
    toast('Lien copié.', 'ok', 2500)
  }
}

onMounted(fetchDetails)
</script>
