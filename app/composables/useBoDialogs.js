// Remplace les `confirm()` / `alert()` natifs du backoffice.
//
// L'hôte (<BoDialogHost />) est monté une seule fois dans le layout `booking`,
// les pages n'ont donc aucun état de dialogue à porter :
//
//   if (!await confirmAction({ title: '…', message: '…', tone: 'danger' })) return
//   toast('Date supprimée.')
//
// Volontairement distinct de useSnackbar()/<AppSnackbar> : celui-ci est monté
// dans le layout `funnel`, n'affiche qu'un message à la fois et se peint avec
// les couleurs du thème vitrine. Le backoffice a besoin d'une pile (une
// suppression peut retourner plusieurs messages), du dialogue de confirmation,
// et des tokens --bo-*.

export const useBoDialogs = () => {
  const confirmState = useState('bo-confirm', () => null)
  const toasts = useState('bo-toasts', () => [])

  // Le resolver ne vit que côté client, entre l'ouverture et la réponse : le
  // stocker hors du state évite de le sérialiser dans le payload SSR.
  const resolver = useState('bo-confirm-resolver', () => ({ resolve: null }))

  const confirmAction = ({
    title,
    message = '',
    detail = '',
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    tone = 'default',
  }) => {
    confirmState.value = { title, message, detail, confirmLabel, cancelLabel, tone }
    return new Promise((resolve) => {
      resolver.value.resolve = resolve
    })
  }

  const answerConfirm = (value) => {
    confirmState.value = null
    const resolve = resolver.value.resolve
    resolver.value.resolve = null
    if (resolve) resolve(value)
  }

  let nextId = 0
  const toast = (message, tone = 'default', timeout = 5000) => {
    const id = `${Date.now()}-${nextId++}`
    toasts.value = [...toasts.value, { id, message, tone, timeout }]
    return id
  }

  const dismissToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { confirmState, confirmAction, answerConfirm, toasts, toast, dismissToast }
}
