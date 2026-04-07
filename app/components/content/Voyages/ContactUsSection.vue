<template>
  <v-row
    justify="center"
    class="my-4 my-md-6 "
  >
    <v-col
      cols="12"
    >
      <v-card
        elevation="0"

        class="pa-4 pa-md-6 d-flex flex-column flex-md-row align-center justify-space-between ga-4 border-custom"
        color="grey-light-3"
      >
        <div class="d-flex align-center ga-4">
          <div
            v-if="teamMembers && teamMembers.length > 0"
            class="avatar-stack"
          >
            <v-avatar
              v-for="(member, i) in teamMembers.slice(0, 3)"
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
            <p class="text-body-1 font-weight-bold text-primary mb-2">
              {{ title }}
            </p>
            <p
              v-if="subtitle"
              class="text-body-2 text-primary-light-2 mb-0"
            >
              {{ subtitle }}
            </p>
          </div>
        </div>
        <v-btn
          height="50"
          class="text-none"
          variant="flat"
          @click="dialog = true"
        >
          <v-icon
            start
            size="25"
          >
            {{ mdiWhatsapp }}
          </v-icon>
          {{ buttonText }}
        </v-btn>
      </v-card>
    </v-col>

    <v-dialog
      v-model="dialog"
      max-width="700"
      transition="dialog-bottom-transition"
    >
      <v-card
        rounded="xl"
        class="dialog-card pa-6 pa-md-8 position-relative"
      >
        <v-btn
          variant="tonal"
          size="small"
          rounded="pill"
          class="close-btn"
          @click="dialog = false"
        >
          <v-icon
            start
            size="16"
          >
            {{ mdiClose }}
          </v-icon>
          Fermer
        </v-btn>

        <div class="text-center mt-8 mt-md-4 mb-8">
          <h3 class="text-h5 font-weight-bold text-primary mb-3">
            {{ dialogTitle }}
          </h3>
          <p
            v-if="dialogSubtitle"
            class="text-body-2 text-grey-darken-1 mb-1"
          >
            {{ dialogSubtitle }}
          </p>
          <p
            v-if="dialogSchedule"
            class="text-caption text-grey mb-0 font-italic"
          >
            {{ dialogSchedule }}
          </p>
        </div>

        <v-row
          justify="center"
          class="px-2"
        >
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              :href="whatsappUrl"
              target="_blank"
              rel="noopener"
              elevation="0"
              rounded="xl"
              class="option-card whatsapp-card d-flex flex-column align-center justify-center pa-6"
              @click="handleWhatsappClick"
            >
              <p class="text-subtitle-1 font-weight-bold text-primary mb-3">
                {{ whatsappLabel }}
              </p>
              <v-btn
                color="green-whatsapp-btn"
                rounded="pill"
                class="text-none option-btn"
                height="44"
              >
                <v-icon
                  start
                  size="20"
                >
                  {{ mdiWhatsapp }}
                </v-icon>
                {{ whatsappSubtitle }}
              </v-btn>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              :href="'tel:' + phoneNumber.replace(/\s/g, '')"
              elevation="0"
              rounded="xl"
              class="option-card phone-card d-flex flex-column align-center justify-center pa-6"
              @click="handlePhoneClick"
            >
              <p class="text-subtitle-1 font-weight-bold text-primary mb-3">
                {{ phoneLabel }}
              </p>
              <v-btn
                color="brown-lighten-4"
                rounded="pill"
                class="text-none option-btn"
                height="44"
              >
                <v-icon
                  start
                  size="18"
                >
                  {{ mdiPhone }}
                </v-icon>
                {{ phoneSubtitle }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { mdiWhatsapp, mdiClose, mdiPhone } from '@mdi/js'

const props = defineProps({
  contactSection: {
    type: Object,
    default: null,
  },
})

const img = useImage()
const { trackWhatsappClick, trackCallClick } = useGtmTracking()

const dialog = ref(false)

const cs = computed(() => props.contactSection || {})

const title = computed(() => cs.value.title || 'Et oui, Élodie, Samantha et Laurane sont de vraies personnes.')
const subtitle = computed(() => cs.value.subtitle || 'Et elles sont là pour te renseigner !')
const buttonText = computed(() => cs.value.buttonText || 'Contacte-nous')
const dialogTitle = computed(() => cs.value.dialogTitle || 'Tu as une question ?')
const dialogSubtitle = computed(() => cs.value.dialogSubtitle || 'Contactez gratuitement nos conseillers voyage')
const dialogSchedule = computed(() => cs.value.dialogSchedule || 'De 9h à 18h du lundi au vendredi')
const whatsappLabel = computed(() => cs.value.whatsappLabel || 'Par WhatsApp')
const whatsappUrl = computed(() => cs.value.whatsappUrl || 'https://wa.me/+33780919540')
const whatsappSubtitle = computed(() => cs.value.whatsappSubtitle || 'Les Aventureurs')
const phoneLabel = computed(() => cs.value.phoneLabel || 'Par Téléphone')
const phoneNumber = computed(() => cs.value.phoneNumber || '+33 4 84 98 01 65')
const phoneSubtitle = computed(() => cs.value.phoneSubtitle || '(+33) 4 84 98 01 65')
const teamMembers = computed(() => cs.value.teamMembers || [])

const handleWhatsappClick = () => {
  trackWhatsappClick()
}

const handlePhoneClick = () => {
  trackCallClick('contact_section')
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
  margin-left: -10px;
}

.avatar-center {
  z-index: 2;
  margin-left: -10px;
}

.dialog-card {
  overflow: visible;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.option-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 120px;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.option-card:hover .option-btn {
  transform: scale(1.04);
  text-decoration: none!important;
}
.option-card:hover :deep() {
  text-decoration: none!important;
}

.option-btn {
  transition: transform 0.2s ease;
}

.whatsapp-card {
  background-color: #e8f5e9;
}

.phone-card {
  background-color: #efebe9;
}
.border-custom{
  border: 2px solid #56a88067;
}
</style>
