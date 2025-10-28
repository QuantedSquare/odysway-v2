export default function (command, event, data = null) {
  if (typeof window === 'undefined') return
  
  const isConsent = localStorage.getItem('consent') === 'granted'
  if (isConsent && window.fbq) {
    if (data) {
      window.fbq(command, event, data)
    } else {
      window.fbq(command, event)
    }
  }
}
