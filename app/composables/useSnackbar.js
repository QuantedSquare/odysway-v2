// Lightweight global snackbar for user-facing notifications inside the funnel.
// State is shared via useState so any component/composable can trigger it and a
// single <AppSnackbar> (mounted in the funnel layout) renders it.
export function useSnackbar() {
  const state = useState('snackbar:state', () => ({
    show: false,
    text: '',
    color: 'error',
    timeout: 6000,
  }))

  const notify = ({ text, color = 'info', timeout = 6000 }) => {
    state.value = { show: true, text, color, timeout }
  }

  const notifyError = (text = 'Une erreur est survenue, veuillez réessayer.') => {
    notify({ text, color: 'error', timeout: 8000 })
  }

  const close = () => {
    state.value = { ...state.value, show: false }
  }

  return { state, notify, notifyError, close }
}
