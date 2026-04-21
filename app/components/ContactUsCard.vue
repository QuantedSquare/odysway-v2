<template>
  <!-- Section variant: horizontal layout (checkout, voyage page body) -->
  <v-card
    v-if="variant === 'section'"
    elevation="0"
    rounded="xl"
    class="pa-4 pa-md-6 d-flex flex-column flex-md-row align-center justify-space-between ga-4 border-custom"
    color="grey-light-3"
  >
    <div class="d-flex align-center ga-4">
      <div
        v-if="avatars && avatars.length > 0"
        class="avatar-stack"
      >
        <v-avatar
          v-for="(member, i) in avatars.slice(0, 3)"
          :key="member._id || i"
          :size="i === 1 ? 56 : 44"
          class="avatar-item"
          :class="{ 'avatar-center': i === 1 }"
        >
          <v-img
            :src="img(getImageUrl(member.image?.asset?._ref), { format: 'webp', quality: 70, width: 112 })"
            :alt="member.name || 'Team member'"
            cover
          />
        </v-avatar>
      </div>
      <div>
        <p class="text-body-1 font-weight-bold text-primary mb-1">
          {{ title }}
        </p>
        <p
          v-if="subtitle"
          class="text-body-2 text-primary-light-2 mb-1"
        >
          {{ subtitle }}
        </p>
        <div class="d-flex align-center ga-3 flex-wrap">
          <a
            href="https://wa.me/+33780919540"
            class="text-decoration-underline text-primary text-body-2"
            @click="handleWhatsappClick"
          >💬 WhatsApp</a>
          <span class="text-grey">·</span>
          <a
            href="tel:+33184807975"
            class="text-primary text-body-2"
          >+33 1 84 80 79 75</a>
          <span class="text-caption text-grey">· Lun-Ven 9h-19h</span>
        </div>
      </div>
    </div>
    <v-btn
      height="50"
      rounded="md"
      color="secondary"
      class="text-none flex-shrink-0"
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
  </v-card>

  <!-- Card variant: compact vertical layout (voyage page sidebar) -->
  <v-card
    v-else
    class="mt-6"
  >
    <v-card-text>
      <v-container
        fluid
        class="pa-6"
      >
        <v-row>
          <v-col
            cols="12"
            lg="3"
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
            <div class="text-h6">
              {{ title }}
            </div>
            <div class="text-subtitle-2 font-weight-regular">
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
              height="60"
              block
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
              Vous préférez ?
              💬 <a
                href="https://wa.me/+33780919540"
                class="text-decoration-underline text-primary"
                @click="handleWhatsappClick"
              >WhatsApp</a> ou
            </div>
          </v-col>
          <v-col
            cols="12"
            class="pt-0"
          >
            <a
              href="tel:+33184807975"
              class="text-primary"
            >+33 1 84 80 79 75</a>
          </v-col>
        </v-row>
        <v-row v-if="showPrivatisation && privatisationText">
          <v-divider />
          <v-col class="pb-0">
            <div class="text-center">
              Groupe privé ?
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
  title: {
    type: String,
    default: 'Vous préférez en parler ?',
  },
  subtitle: {
    type: String,
    default: 'Coralie, Lucia & Marina · Lun - Ven 9h-19h',
  },
  rdvButtonText: {
    type: String,
    default: 'Prendre RDV — c\'est Gratuit',
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
    default: '',
  },
  privatisationLink: {
    type: String,
    default: '/devis',
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

.border-custom {
  border: 2px solid #56a88067;
}
</style>
