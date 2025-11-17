export default function (command, event, data = null) {
  const { $fbq } = useNuxtApp()
  const isConsent = localStorage.getItem('consent') === 'granted'
  if (isConsent) {
    $fbq(command, event, data)
  }
}
