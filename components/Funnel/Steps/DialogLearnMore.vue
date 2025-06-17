<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    transition="dialog-bottom-transition"
  >
    <template #activator="{ props: activatorProps } ">
      <v-row>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <v-col cols="12">
          <div
            v-if="btnText"
            v-html="btnText"
          />
          <v-btn
            x-small
            variant="text"
            class="pl-0 text-caption"
            v-bind="activatorProps"
          >
            {{ funnelTexts.dialogs.learn_more_btn }}
          <!-- {{ $t('stepperDevisGroup.learnMore') }} -->
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-card
      rounded="lg"
    >
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          {{ funnelTexts.dialogs.learn_more_title }}
        </div>
        <v-btn
          :icon="mdiClose"
          variant="text"
          @click="dialog = false"
        />
      </v-card-title>

      <v-card-text>
        <div
          style="min-height: 200px"
          v-html="dialogText"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiClose } from '@mdi/js'

const dialog = ref(false)
const props = defineProps(['dialogText', 'btnText', 'funnelTexts'])
</script>
