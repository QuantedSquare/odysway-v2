<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-form
          ref="form"
          v-model="formIsValid"
          @submit.prevent="submit"
        >
          <v-row
            class="rounded-md pa-4 subtle-shadow"
          >
            <v-col
              cols="12"
            >
              <div>
                Civilité *
              </div>
              <v-select
                v-model="civility"
                max-width="350"
                :items="status"
                placeholder="Choisissez une civilité"
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
                Nom *
              </div>
              <v-text-field
                v-model="lastName"
                placeholder="Votre nom"
                :rules="[rules.lastname]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <div>
                Prenom *
              </div>
              <v-text-field
                v-model="firstName"
                placeholder="Votre prénom"
                :rules="[rules.firstname]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <div>
                Numéro de téléphone
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
                Adresse email *
              </div>
              <v-text-field
                v-model="email"
                :rules="[rules.email]"
                placeholder="Votre adresse email"
              />
            </v-col>
            <v-col
              cols="12"
            >
              <div>
                Objet de message *
              </div>
              <v-text-field
                v-model="subject"
                :rules="[rules.subject]"
                placeholder="Votre objet de message"
                :counter="1"
              />
            </v-col>
            <v-col cols="12">
              <div>
                Message *
              </div>
              <v-textarea
                v-model="message"
                variant="outlined"
                :rules="[rules.message]"
                placeholder="Votre message"
                :counter="20"
              />
            </v-col>
            <v-col
              cols="12"
              class="d-flex justify-end"
            >
              <v-btn-secondary
                class="me-4"
                type="submit"
                :disabled="!formIsValid"
              >
                Envoyer
              </v-btn-secondary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { z } from 'zod'
import { ref } from 'vue'

const civility = ref('M.')
const status = [
  { title: 'M.', value: 'M.' },
  { title: 'Mme.', value: 'Mme.' },
  { title: 'Autre', value: 'Autre' },
]
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const subject = ref('')

const formIsValid = ref(false)
const form = ref(null)

const schemaToRule = useZodSchema()
const civilitySchema = z.enum(['M.', 'Mme.'], { errorMap: () => ({ message: 'Veuillez choisir une civilité.' }) })
const firstnameSchema = z.string().min(1, 'Cette information est requise.')
const lastnameSchema = z.string().min(1, 'Cette information est requise.')
const emailSchema = z.string().email('Adresse email invalide')
const subjectSchema = z.string().min(1, 'Au moins un caractère est requis')
const messageSchema = z.string().min(20, 'Au moins 20 caractères sont requis')

const rules = {
  civility: schemaToRule(civilitySchema),
  firstname: schemaToRule(firstnameSchema),
  lastname: schemaToRule(lastnameSchema),
  email: schemaToRule(emailSchema),
  subject: schemaToRule(subjectSchema),
  message: schemaToRule(messageSchema),
}

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
  const check = await apiRequest('/brevo/email', 'post', data)
  console.log('========check=======', check)
}
</script>

<style scoped>
.contact-form-shadow {
  min-height: 88px!important;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
</style>
