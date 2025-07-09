<template>
  <v-container>
    <v-row>
      <v-col>
        <h3>
          {{ page.third_step.title }}
        </h3>
      </v-col>
    </v-row>
    <v-form>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="model.firstname"
            :label="page.form_labels.firstname"
            required
            :rules="[rules.name]"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="model.lastname"
            :label="page.form_labels.lastname"
            required
            :rules="[rules.name]"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="model.email"
            :label="page.form_labels.email"
            required
            :rules="[rules.email]"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <PhoneTextField
            v-model="model.phone"
            @validity-changed="model.validatePhone = $event"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <v-checkbox
            v-model="model.acceptTerms"
            required
          >
            <template #label>
              <div
                class="text-body-2"
                v-html="page.third_step.sub_1"
              />
            </template>
          </v-checkbox>
          <v-checkbox
            v-model="model.subscribeToNewsletter"
            required
            :label="page.third_step.sub_2"
          />
        </v-col>
        <v-col
          cols="12"
          class="d-flex justify-center"
        >
          <v-btn
            height="50"
            :append-icon="mdiSend"
            class="bg-secondary "
            :disabled="(!validateInfos)"
            :loading="model.loading"
            @click="emit('submit')"
          >
            <span class="text-wrap">
              Envoyer ma demande
            </span>
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import { z } from 'zod'
import { mdiSend } from '@mdi/js'

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })

const emit = defineEmits(['submit'])

const validateInfos = computed(() => {
  return model.value.firstname && model.value.lastname && model.value.email && model.value.validatePhone && model.value.acceptTerms
})

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
}
const { page } = defineProps({
  page: {
    type: Object,
    required: true,
  },
})
const model = defineModel()
</script>
