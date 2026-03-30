const EMBED_SCRIPT_URL = 'https://app.cal.com/embed/embed.js'

function loadCalScript() {
  return new Promise((resolve) => {
    if (window.Cal) {
      resolve(window.Cal)
      return
    }

    ;(function (C, A, L) {
      const p = function (a, ar) {
        a.q.push(ar)
      }
      const d = C.document
      C.Cal = C.Cal || function () {
        const cal = C.Cal
        const ar = arguments
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          d.head.appendChild(d.createElement('script')).src = A
          cal.loaded = true
        }
        if (ar[0] === L) {
          const api = function () {
            p(api, arguments)
          }
          const namespace = ar[1]
          api.q = api.q || []
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api
            p(cal.ns[namespace], ar)
            p(cal, ['initNamespace', namespace])
          }
          else {
            p(cal, ar)
          }
          return
        }
        p(cal, ar)
      }
    })(window, EMBED_SCRIPT_URL, 'init')
    resolve(window.Cal)
  })
}

export function useCalEmbed() {
  const isReady = ref(false)

  async function init(namespace, calLink, elementSelector, config = {}) {
    if (!import.meta.client) return

    const Cal = await loadCalScript()

    Cal('init', namespace, { origin: 'https://app.cal.com' })

    Cal.ns[namespace]('inline', {
      elementOrSelector: elementSelector,
      calLink,
      config: {
        layout: 'month_view',
        ...config,
      },
    })

    Cal.ns[namespace]('ui', {
      cssVarsPerTheme: {
        light: { 'cal-brand': '#2b4c51' },
        dark: { 'cal-brand': '#2b4c51' },
      },
      hideEventTypeDetails: false,
      layout: 'month_view',
    })

    return Cal.ns[namespace]
  }

  function on(calNs, action, callback) {
    if (!calNs) return
    calNs('on', { action, callback })
  }

  function onLinkReady(calNs, callback) {
    on(calNs, 'linkReady', () => {
      isReady.value = true
      callback?.()
    })
  }

  function onBookingSuccess(calNs, callback) {
    on(calNs, 'bookingSuccessful', (event) => {
      const data = event.detail?.data
      callback?.(data)
    })
  }

  function onRouteChanged(calNs, callback) {
    on(calNs, '__routeChanged', () => {
      callback?.()
    })
  }

  function onNavigatedToBooker(calNs, callback) {
    on(calNs, 'navigatedToBooker', () => {
      callback?.()
    })
  }

  return {
    init,
    on,
    onLinkReady,
    onBookingSuccess,
    onRouteChanged,
    onNavigatedToBooker,
    isReady,
  }
}
