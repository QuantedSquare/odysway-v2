<template>
  <!-- Section variant: horizontal layout (checkout, voyage page body) -->
  <v-card
    v-if="variant === 'section'"
    elevation="0"
    rounded="md"
    class="pa-4 pa-md-6 px-md-10 d-flex flex-column  align-center justify-space-between ga-4 border-custom"
    color="white"
  >
    <div class=" d-flex flex-column flex-md-row align-center justify-space-between ga-4 w-100 ">
      <div class="d-flex flex-column align-center align-md-start ga-3">
        <div>
          <p class="text-h5 font-weight-bold text-primary mb-0">
            {{ title }}
          </p>
          <p
            v-if="subtitle"
            class="text-subtitle-2 font-weight-regular mb-0 text-primary"
          >
            {{ subtitle }}
          </p>
        </div>
        <div class="d-flex flex-column flex-md-row align-center justify-center  ga-2 ">
          <div
            v-if="avatars && avatars.length > 0"
            class="avatar-stack flex-shrink-0"
          >
            <v-avatar
              v-for="(member, i) in avatars.slice(0, 3)"
              :key="member._id || i"
              :size="50"
              class="avatar-item"
            >
              <v-img
                :src="img(getImageUrl(member.image?.asset?._ref), { format: 'webp', quality: 70, width: 72 })"
                :alt="member.name || 'Team member'"
                cover
              />
            </v-avatar>
          </div>
          <v-row class="d-none d-md-flex text-center text-md-start">
            <v-col
              cols="12"
              class="py-0"
            >
              <div class="text-primary ">
                {{ contactPreferenceText }}
                💬 <a
                  :href="whatsappUrl"
                  class="text-decoration-underline text-primary"
                  @click="handleWhatsappClick"
                >{{ whatsappLabel }}</a> ou
              </div>
            </v-col>
            <v-col
              cols="12"
              class="pt-0"
            >
              <a
                :href="phoneHref"
                class="text-primary"
              >{{ phoneNumber }}</a> <span class="text-caption text-grey">{{ businessHours }}</span>
            </v-col>
          </v-row>
        </div>
        <!-- Desktop only: contact links inline -->
        <v-spacer />
      </div>
      <v-btn
        height="50"
        rounded="md"
        block
        color="secondary"
        class="text-none flex-shrink-0 d-flex d-md-none"
        :to="rdvLink"
        @click="trackRdvClick('contact-us-card-section')"
      >
        <v-icon
          start
          size="20"
        >
          {{ mdiCalendar }}
        </v-icon>
        {{ rdvButtonText }}
      </v-btn>
      <v-btn
        height="50"
        rounded="md"
        color="secondary"
        variant="outlined"
        class="text-none flex-shrink-0 d-none d-md-flex font-weight-bold"
        :to="rdvLink"
        @click="trackRdvClick('contact-us-card-section')"
      >
        <div class="text-body-2 font-weight-bold text-decoration-none">
          <v-icon
            start
            size="20"
          >
            {{ mdiCalendar }}
          </v-icon>
          {{ rdvButtonText }}
        </div>
      </v-btn>
      <!-- Mobile only: contact links centered below button -->
      <div class="d-flex flex-column d-md-none justify-center align-center ga-2 flex-wrap text-center">
        <span>
          💬
          <a
            :href="whatsappUrl"
            class="text-decoration-underline text-primary text-body-2 font-weight-bold"
            @click="handleWhatsappClick"
          >{{ whatsappLabel }}</a> <span class="text-grey">· </span>
          <a
            :href="phoneHref"
            class="text-body-2 font-weight-bold text-primary"
          >{{ phoneNumber }}</a>
        </span>

        <span class="text-caption text-grey">{{ businessHours }}</span>
      </div>
    </div>
  </v-card>

  <!-- Card variant: compact vertical layout (voyage page sidebar) -->
  <v-card
    v-else
    class="mt-6 "
  >
    <v-card-text class="pa-2">
      <v-container
        fluid
        class="px-3"
      >
        <v-row>
          <v-col
            cols="12"
            lg="4"
          >
            <div
              v-if="avatars && avatars.length > 0"
              class="avatar-stack d-flex justify-center align-center h-100"
            >
              <v-avatar
                v-for="(member, i) in avatars.slice(0, 3)"
                :key="member._id || i"
                :size="i === 1 ? 40 : 32"
                class="avatar-item"
                :class="{ 'avatar-center': i === 1 }"
              >
                <v-img
                  :src="img(getImageUrl(member.image?.asset?._ref), { format: 'webp', quality: 70, width: 72 })"
                  :alt="member.name || 'Team member'"
                  cover
                />
              </v-avatar>
            </div>
          </v-col>
          <v-col>
            <div class="text-subtitle-2">
              {{ title }}
            </div>
            <div class="text-caption font-weight-regular">
              {{ subtitle }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            class="d-flex flex-column align-start pt-0"
          >
            <v-btn
              height="50"
              block
              :variant="btnVariant"
              rounded="md"
              color="secondary"
              :to="rdvLink"
              @click="trackRdvClick('contact-us-card')"
            >
              <span class="text-caption text-lg-body-2 font-weight-bold text-decoration-none">
                {{ rdvButtonText }}
              </span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          class="text-center"
          align="center"
        >
          <v-col
            cols="12"
            class="pb-0 pt-0"
          >
            <div class="text-primary text-center">
              {{ contactPreferenceText }}
              💬 <a
                :href="whatsappUrl"
                class="text-decoration-underline text-primary font-weight-bold"
                @click="handleWhatsappClick"
              >{{ whatsappLabel }}</a>
            </div>
          </v-col>
          <v-col
            cols="12"
            class="pt-0"
          >
            ou
            <a
              :href="phoneHref"
              class="text-grey text-caption "
            >{{ phoneNumber }}</a> <span class="text-caption text-grey">{{ businessHours }}</span>
          </v-col>
        </v-row>
        <v-row v-if="showPrivatisation && privatisationText">
          <v-divider />
          <v-col class="pb-0">
            <div class="text-center">
              {{ privateGroupText }}
              <NuxtLink
                :to="privatisationLink"
                @click="handlePrivatisationClick"
              >
                <span class="text-decoration-underline text-grey">
                  {{ privatisationText }}
                </span>
              </NuxtLink>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { mdiCalendar } from '@mdi/js'

const props = defineProps({
  variant: {
    type: String,
    default: 'card',
    validator: v => ['card', 'section'].includes(v),
  },
  avatars: {
    type: Array,
    default: () => ['C', 'L', 'M'],
  },
  btnVariant: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Vous avez des questions ?',
  },
  subtitle: {
    type: String,
    default: 'Nos conseillères vous aident à finaliser.',
  },
  rdvButtonText: {
    type: String,
    default: 'Prendre RDV avec un conseiller',
  },
  rdvLink: {
    type: String,
    default: '/rdv-projet-voyage',
  },
  showPrivatisation: {
    type: Boolean,
    default: false,
  },
  privatisationText: {
    type: String,
    default: 'Privatiser ce voyage',
  },
  privatisationLink: {
    type: String,
    default: '/devis',
  },
  whatsappUrl: {
    type: String,
    default: 'https://wa.me/+33780919540',
  },
  whatsappLabel: {
    type: String,
    default: 'WhatsApp',
  },
  phoneNumber: {
    type: String,
    default: '+33 1 84 80 79 75',
  },
  phoneHref: {
    type: String,
    default: 'tel:+33184807975',
  },
  businessHours: {
    type: String,
    default: 'Lun-Ven 9h-19h',
  },
  contactPreferenceText: {
    type: String,
    default: 'Vous préférez ?',
  },
  privateGroupText: {
    type: String,
    default: 'Groupe privé ?',
  },
})

const emit = defineEmits(['privatisation-click'])

const img = useImage()
const { trackRdvClick, trackWhatsappClick: _trackWhatsapp, trackCtaClick } = useGtmTracking()

const handleWhatsappClick = () => {
  _trackWhatsapp()
}

const handlePrivatisationClick = () => {
  trackCtaClick({
    ctaId: 'button-indiv-funnel-contact-us-card',
    ctaLabel: props.privatisationText,
    ctaUrl: props.privatisationLink,
  })
  emit('privatisation-click')
}
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-item {
  border: 2px solid white;
}

.avatar-item + .avatar-item {
  margin-left: -8px;
}

.avatar-center {
  z-index: 2;
  margin-left: -8px;
}
</style>
