<template>
  <div>
    <v-dialog
      :model-value="!!confirmState"
      max-width="440"
      persistent
      @update:model-value="answerConfirm(false)"
    >
      <v-card v-if="confirmState">
        <v-card-title>{{ confirmState.title }}</v-card-title>
        <v-card-text>
          <p
            v-if="confirmState.message"
            class="mb-0"
          >
            {{ confirmState.message }}
          </p>
          <p
            v-if="confirmState.detail"
            class="bo-hint mt-2 mb-0"
          >
            {{ confirmState.detail }}
          </p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="answerConfirm(false)"
          >
            {{ confirmState.cancelLabel }}
          </v-btn>
          <v-btn
            :color="confirmState.tone === 'danger' ? 'error' : 'primary'"
            variant="flat"
            @click="answerConfirm(true)"
          >
            {{ confirmState.confirmLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="bo-toaster">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="bo-toast"
        :class="`bo-toast--${item.tone}`"
        role="status"
      >
        <span class="bo-toast__msg">{{ item.message }}</span>
        <v-btn
          :icon="mdiClose"
          size="x-small"
          variant="text"
          density="comfortable"
          aria-label="Fermer"
          @click="dismissToast(item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { mdiClose } from '@mdi/js'

const { confirmState, answerConfirm, toasts, dismissToast } = useBoDialogs()

// Chaque toast programme sa propre disparition à l'ajout.
const scheduled = new Set()
watch(toasts, (list) => {
  for (const item of list) {
    if (scheduled.has(item.id)) continue
    scheduled.add(item.id)
    if (item.timeout > 0) {
      setTimeout(() => {
        dismissToast(item.id)
        scheduled.delete(item.id)
      }, item.timeout)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.bo-toaster {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2500;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(420px, calc(100vw - 40px));
}

.bo-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px 9px 14px;
  font-size: 12.5px;
  background: var(--bo-surface);
  border: 1px solid var(--bo-line);
  border-left: 3px solid var(--bo-toast-c, var(--bo-ink-3));
  border-radius: var(--bo-radius);
  box-shadow: var(--bo-shadow-pop);
}

.bo-toast--ok { --bo-toast-c: var(--bo-ok); }
.bo-toast--warn { --bo-toast-c: var(--bo-warn); }
.bo-toast--crit { --bo-toast-c: var(--bo-crit); }

.bo-toast__msg {
  flex: 1;
  min-width: 0;
  white-space: pre-line;
}
</style>
