<template>
  <v-card
    rounded="lg"
    elevation="0"
    class="bo-card"
  >
    <v-card-title class="pb-0 d-flex align-center ga-2">
      <v-icon
        size="18"
        color="secondary"
      >
        {{ mdiFormatListBulleted }}
      </v-icon>
      Notes & discussion
      <v-spacer />
      <v-switch
        v-model="showDeleted"
        label="Supprimées"
        color="error"
        density="compact"
        hide-details
        class="flex-grow-0 text-caption"
        @update:model-value="fetchNotes"
      />
    </v-card-title>
    <v-card-text>
      <div
        v-if="loading"
        class="d-flex justify-center py-4"
      >
        <v-progress-circular
          indeterminate
          size="24"
          color="primary"
        />
      </div>

      <template v-else>
        <div
          v-if="!notes.length"
          class="text-body-2 text-medium-emphasis py-2"
        >
          Aucune note pour le moment.
        </div>

        <div
          v-for="note in notes"
          :key="note.id"
          class="bg-surface-variant rounded-lg pa-3 mb-2"
        >
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex align-center ga-2">
              <v-avatar
                size="24"
                color="primary"
                class="text-white"
              >
                <v-img
                  v-if="note.author_picture"
                  :src="note.author_picture"
                  alt="Avatar"
                />
                <span
                  v-else
                  style="font-size: 11px; font-weight: 600;"
                >
                  {{ (note.author_name || note.author_email || '?').slice(0, 1).toUpperCase() }}
                </span>
              </v-avatar>
              <span class="text-caption font-weight-medium">
                {{ note.author_name || note.author_email }}
              </span>
            </div>
            <div class="d-flex align-center ga-1">
              <span class="text-caption text-medium-emphasis">
                {{ dayjs(note.created_at).format('DD/MM/YYYY HH:mm') }}
              </span>
              <span
                v-if="note.deleted"
                class="text-caption text-error"
              >
                supprimée par {{ note.deleted_by || '?' }}
              </span>
              <v-btn
                v-if="note.deleted"
                icon
                size="x-small"
                color="primary"
                variant="text"
                @click="restoreNote(note)"
              >
                <v-icon size="14">
                  {{ mdiRestore }}
                </v-icon>
              </v-btn>
              <v-btn
                v-else-if="canDelete(note)"
                icon
                size="x-small"
                color="error"
                variant="text"
                @click="deleteNote(note)"
              >
                <v-icon size="14">
                  {{ mdiDelete }}
                </v-icon>
              </v-btn>
            </div>
          </div>
          <div
            v-dompurify-html="note.content"
            class="text-body-2 note-content"
          />
        </div>
      </template>

      <ClientOnly>
        <div class="mt-3">
          <div class="bo-toolbar mb-2">
            <v-btn
              size="x-small"
              variant="text"
              :color="editor?.isActive('bold') ? 'primary' : undefined"
              @click="editor?.chain().focus().toggleBold().run()"
            >
              <strong>B</strong>
            </v-btn>
            <v-btn
              size="x-small"
              variant="text"
              :color="editor?.isActive('italic') ? 'primary' : undefined"
              @click="editor?.chain().focus().toggleItalic().run()"
            >
              <em>I</em>
            </v-btn>
            <v-btn
              size="x-small"
              variant="text"
              :color="editor?.isActive('bulletList') ? 'primary' : undefined"
              @click="editor?.chain().focus().toggleBulletList().run()"
            >
              <v-icon size="16">
                {{ mdiFormatListBulleted }}
              </v-icon>
            </v-btn>
            <v-btn
              size="x-small"
              variant="text"
              :color="editor?.isActive('link') ? 'primary' : undefined"
              @click="openLinkDialog"
            >
              <v-icon size="16">
                {{ mdiLinkVariant }}
              </v-icon>
            </v-btn>
          </div>
          <EditorContent
            :editor="editor"
            class="tiptap-editor "
          />
          <v-btn
            color="primary"
            size="small"
            variant="tonal"
            class="mt-3"
            :loading="submitting"
            :disabled="submitting"
            @click="submitNote"
          >
            Envoyer
          </v-btn>
        </div>
      </ClientOnly>

      <v-dialog
        v-model="linkDialog"
        max-width="360"
      >
        <v-card>
          <v-card-title class="text-subtitle-1">
            Ajouter un lien
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="linkUrl"
              label="URL"
              placeholder="https://..."
              density="comfortable"
              autofocus
              @keydown.enter="applyLink"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="linkDialog = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              @click="applyLink"
            >
              Appliquer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { mdiDelete, mdiFormatListBulleted, mdiLinkVariant, mdiRestore } from '@mdi/js'
import dayjs from 'dayjs'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const { confirmAction, toast } = useBoDialogs()

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
})

const bookingUser = useState('bookingUser')
const notes = ref([])
const loading = ref(true)
const submitting = ref(false)
const linkDialog = ref(false)
const linkUrl = ref('')
const showDeleted = ref(false)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      code: false,
      heading: false,
      blockquote: false,
      horizontalRule: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  ],
  content: '',
})

function canDelete(note) {
  if (!bookingUser.value) return false
  return bookingUser.value.email === note.author_email || bookingUser.value.role === 'superadmin'
}

function openLinkDialog() {
  const existingHref = editor.value?.getAttributes('link').href
  linkUrl.value = existingHref || ''
  linkDialog.value = true
}

function applyLink() {
  if (linkUrl.value) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  else {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  }
  linkDialog.value = false
  linkUrl.value = ''
}

async function fetchNotes() {
  try {
    notes.value = await bookingApi.getNotes(
      props.slug,
      props.dateId,
      showDeleted.value ? { includeDeleted: true } : {},
    )
  }
  catch (err) {
    console.error('Error fetching notes:', err)
  }
  finally {
    loading.value = false
  }
}

async function restoreNote(note) {
  const ok = await confirmAction({ title: 'Restaurer cette note ?', confirmLabel: 'Restaurer' })
  if (!ok) return

  try {
    await bookingApi.restoreChild(props.slug, props.dateId, 'note', note.id)
    await fetchNotes()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la restauration'), 'crit')
  }
}

async function submitNote() {
  if (!editor.value) return
  const content = editor.value.getHTML()
  if (!content || content === '<p></p>') return

  submitting.value = true
  try {
    await bookingApi.addNote(props.slug, props.dateId, { content })
    editor.value.commands.clearContent()
    await fetchNotes()
  }
  catch (err) {
    console.error('Error adding note:', err)
  }
  finally {
    submitting.value = false
  }
}

async function deleteNote(note) {
  const ok = await confirmAction({
    title: 'Supprimer cette note ?',
    detail: 'Elle reste restaurable depuis le filtre « Supprimées ».',
    confirmLabel: 'Supprimer',
    tone: 'danger',
  })
  if (!ok) return

  try {
    await bookingApi.deleteNote(props.slug, props.dateId, note.id)
    await fetchNotes()
  }
  catch (err) {
    console.error('Error deleting note:', err)
  }
}

onMounted(fetchNotes)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
/* C'est une zone de saisie : même traitement que les autres champs, sinon elle
   flotte entre la carte et le formulaire. */
.tiptap-editor {
  border: 1px solid var(--bo-field-line);
  border-radius: var(--bo-radius);
  padding: 8px 12px;
  min-height: 80px;
  cursor: text;
  background: var(--bo-field);
}

.tiptap-editor:focus-within {
  border-color: var(--bo-accent);
  box-shadow: 0 0 0 3px var(--bo-accent-wash);
}

.tiptap-editor :deep(.tiptap) {
  outline: none;
  min-height: 60px;
}

.tiptap-editor :deep(.tiptap p) {
  margin: 0;
}
.tiptap-editor :deep(ul) {
  padding-left: 20px;
}
/* `color: black` en dur rendait les notes illisibles en thème sombre. */
.note-content {
  color: var(--bo-ink);
}

.note-content :deep(a) {
  color: var(--bo-accent);
  text-decoration: underline;
}

.note-content :deep(ul) {
  padding-left: 20px;
}
</style>
