<template>
  <v-container>
    <v-row v-if="!isMessageSent">
      <v-col cols="12">
        <h2 class="text-h2 text-center my-8">
          {{ contactContent?.contactForm?.formTitle || 'Formulaire de contact' }}
        </h2>
        <v-form
          ref="form"
          v-model="isValidForm"
          @submit.prevent="submit"
        >
          <v-row
            class="rounded-md pa-4 subtle-shadow"
          >
            <v-col
              cols="12"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.civility?.label || 'Civilité *' }}
              </div>
              <v-select
                v-model="civility"
                max-width="350"
                :items="statusOptions"
                :placeholder="contactContent?.contactForm?.fields?.civility?.placeholder || 'Choisissez une civilité'"
                item-title="title"
                item-value="value"
                :rules="[rules.civility]"
                required
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.lastName?.label || 'Nom *' }}
              </div>
              <v-text-field
                v-model="lastName"
                :placeholder="contactContent?.contactForm?.fields?.lastName?.placeholder || 'Jones'"
                :rules="[rules.lastname]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.firstName?.label || 'Prenom *' }}
              </div>
              <v-text-field
                v-model="firstName"
                :placeholder="contactContent?.contactForm?.fields?.firstName?.placeholder || 'Indiana'"
                :rules="[rules.firstname]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.phone?.label || 'Numéro de téléphone' }}
              </div>
              <PhoneTextField
                v-model="phone"
                :required="true"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.email?.label || 'Adresse email *' }}
              </div>
              <v-text-field
                v-model="email"
                :rules="[rules.email]"
                :placeholder="contactContent?.contactForm?.fields?.email?.placeholder || 'Votre adresse email'"
              />
            </v-col>
            <v-col
              cols="12"
            >
              <div>
                {{ contactContent?.contactForm?.fields?.subject?.label || 'Objet de votre message *' }}
              </div>
              <v-text-field
                v-model="subject"
                :rules="[rules.subject]"
                :placeholder="contactContent?.contactForm?.fields?.subject?.placeholder || 'J\'ai besoin d\'aide pour partir au Japon...'"
                :counter="1"
              />
            </v-col>
            <v-col cols="12">
              <div>
                {{ contactContent?.contactForm?.fields?.message?.label || 'Message *' }}
              </div>
              <v-textarea
                v-model="message"
                variant="outlined"
                :rules="[rules.message]"
                :placeholder="contactContent?.contactForm?.fields?.message?.placeholder || 'Votre message...'"
                :counter="20"
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                v-model="gdprAccepted"
                required
              >
                <template #label>
                  <div class="text-body-2">
                    {{ contactContent?.contactForm?.gdprSection?.agreementText || "J'accepte la" }}
                    <NuxtLink
                      :to="contactContent?.contactForm?.gdprSection?.privacyLinkUrl || '/politique-de-confidentialite'"
                      class="text-primary text-decoration-underline"
                      target="_blank"
                    >
                      {{ contactContent?.contactForm?.gdprSection?.privacyLinkText || 'politique de confidentialité' }}
                    </NuxtLink>
                    {{ contactContent?.contactForm?.gdprSection?.agreementSuffix || 'et consens au traitement de mes données personnelles.' }}
                  </div>
                </template>
              </v-checkbox>
            </v-col>
            <v-col
              cols="12"
              class="d-flex justify-end"
            >
              <v-btn-secondary
                class="me-4"
                type="submit"
                :disabled="!isFormComplete"
              >
                {{ contactContent?.contactForm?.submitButton || 'Envoyer' }}
              </v-btn-secondary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <h3 class="text-h3 text-center my-8">
          {{ contactContent?.contactForm?.successMessage || 'Message envoyé avec succès !' }}
        </h3>
        <p class="text-body-1 text-center my-8">
          {{ contactContent?.contactForm?.successDescription || 'Nous vous répondrons dans les plus brefs délais.' }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { z } from 'zod'
import { ref } from 'vue'

const { contactContent } = defineProps({
  contactContent: {
    type: Object,
    default: () => ({}),
  },
})

const civility = ref('M.')
const statusOptions = computed(() => [
  {
    title: contactContent?.contactForm?.fields?.civility?.options?.mr || 'M.',
    value: 'M.',
  },
  {
    title: contactContent?.contactForm?.fields?.civility?.options?.mrs || 'Mme.',
    value: 'Mme.',
  },
  {
    title: contactContent?.contactForm?.fields?.civility?.options?.other || 'Autre',
    value: 'Autre',
  },
])
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const subject = ref('')
const gdprAccepted = ref(false)
const isMessageSent = ref(false)

const isValidForm = ref(false)
const form = ref(null)

const isFormComplete = computed(() => {
  return isValidForm.value && gdprAccepted.value
})

// Save GDPR acceptance to localStorage when user accepts
watch(gdprAccepted, (newValue) => {
  localStorage.setItem('contact-form-agreement', JSON.stringify(newValue))
  if (newValue) {
    localStorage.setItem('contact-form-agreement-date', new Date().toISOString())
  }
})

const schemaToRule = useZodSchema()

const rules = computed(() => {
  const civilitySchema = z.enum(['M.', 'Mme.'], {
    errorMap: () => ({
      message: contactContent?.contactForm?.validationMessages?.civilityRequired || 'Veuillez choisir une civilité.',
    }),
  })
  const firstnameSchema = z.string().min(1,
    contactContent?.contactForm?.validationMessages?.fieldRequired || 'Cette information est requise.',
  )
  const lastnameSchema = z.string().min(1,
    contactContent?.contactForm?.validationMessages?.fieldRequired || 'Cette information est requise.',
  )
  const emailSchema = z.string().email(
    contactContent?.contactForm?.validationMessages?.invalidEmail || 'Adresse email invalide',
  )
  const subjectSchema = z.string().min(1,
    contactContent?.contactForm?.validationMessages?.minOneCharacter || 'Au moins un caractère est requis',
  )
  const messageSchema = z.string().min(20,
    contactContent?.contactForm?.validationMessages?.minTwentyCharacters || 'Au moins 20 caractères sont requis',
  )

  return {
    civility: schemaToRule(civilitySchema),
    firstname: schemaToRule(firstnameSchema),
    lastname: schemaToRule(lastnameSchema),
    email: schemaToRule(emailSchema),
    subject: schemaToRule(subjectSchema),
    message: schemaToRule(messageSchema),
  }
})

async function submit() {
  const data = {
    civility: civility.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
    subject: subject.value,
    message: message.value,
  }
  try {
    await apiRequest('/brevo/email', 'post', data)
    isMessageSent.value = true
  }
  catch (error) {
    console.error('Error submitting form:', error)
  }
}
</script>

<style scoped>
.contact-form-shadow {
  min-height: 88px!important;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
</style>
