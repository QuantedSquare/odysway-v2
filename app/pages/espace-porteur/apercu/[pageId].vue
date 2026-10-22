<template>
  <div>
    <div class="apercu-bandeau text-caption text-center py-1">
      Aperçu de votre brouillon — les dates et les prix définitifs sont ajoutés par Odysway
    </div>
    <PortagePageContent
      v-if="page && voyage"
      :key="cleRendu"
      :voyage="voyage"
      :page="page"
    />
    <div
      v-else
      class="d-flex justify-center py-16"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>

<script setup>
import portagePage from '#shared/portagePage.js'

// Aperçu d'une page de l'Espace porteur, chargé dans une iframe par l'éditeur
// (/espace-porteur/<id>) : mêmes composants et même mise en page que
// /portage/<slug>, nourris par le brouillon. L'éditeur envoie chaque
// modification par postMessage ; sans lui (onglet ouvert seul), la dernière
// version enregistrée.

definePageMeta({ layout: 'voyage' })
useHead({ title: 'Aperçu', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { api } = useEspacePorteur()
const { data: page } = await useSanityQuery(VOYAGE_PAGE_QUERY)

const payload = ref(null)
const slug = ref(null)
const voyage = computed(() => (payload.value ? portagePage.versVoyageApercu(payload.value, { slug: slug.value }) : null))

// Certains composants lisent leurs props une seule fois (AccompanistsContainer
// les réarrange au montage) : le contenu est remonté quand la structure change,
// pas à chaque frappe.
const cleRendu = computed(() => {
  const p = payload.value
  if (!p) return ''
  return [p.image?.ref, p.galerie.length, p.programme.length, p.hebergements.length, p.faq.length,
    Boolean(p.accompagnateur.nom || p.accompagnateur.presentation || p.accompagnateur.photo)].join('|')
})

const surMessage = (e) => {
  if (e.origin !== window.location.origin || e.data?.type !== 'portage-apercu') return
  payload.value = portagePage.nettoyer(e.data.payload)
}

onMounted(async () => {
  window.addEventListener('message', surMessage)
  try {
    const vue = await api(`/pages/${route.params.pageId}`)
    slug.value = vue.slug
    if (!payload.value) payload.value = vue.payload
  }
  catch {
    payload.value = portagePage.vide()
  }
  // L'éditeur répond avec le brouillon en cours, plus récent que l'enregistré.
  if (window.parent !== window) window.parent.postMessage({ type: 'portage-apercu-pret' }, window.location.origin)
})
onBeforeUnmount(() => window.removeEventListener('message', surMessage))
</script>

<style scoped>
.apercu-bandeau {
  background: #FDF0EC;
  color: #2B4C52;
}
</style>
