/**
 * Anime un bloc tronqué (max-height) sans figer sa hauteur une fois déplié.
 *
 * Figer max-height à la valeur de scrollHeight mesurée au clic coupait le texte
 * dès que le contenu grandissait ensuite (largeur qui diminue, rotation mobile,
 * polices ou images chargées après coup). Une fois l'animation terminée, on
 * relâche donc la contrainte (max-height: none).
 */
export function useExpandableHeight() {
  const TRANSITION_MS = 500
  let releaseTimer = null

  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

  /**
   * @param {HTMLElement} element - Bloc tronqué
   * @param {Ref<Object>} styleRef - Ref du style inline appliqué au bloc
   * @param {boolean} expanded - Nouvel état
   * @param {number} clampHeight - Hauteur repliée en px
   */
  const applyExpanded = async (element, styleRef, expanded, clampHeight) => {
    if (!import.meta.client || !element) return
    clearTimeout(releaseTimer)
    await nextTick()

    if (expanded) {
      await nextFrame()
      styleRef.value.maxHeight = element.scrollHeight + 'px'
      releaseTimer = setTimeout(() => {
        styleRef.value.maxHeight = 'none'
      }, TRANSITION_MS)
    }
    else {
      // Depuis "none", repartir d'une hauteur en px pour que la transition s'anime
      styleRef.value.maxHeight = element.scrollHeight + 'px'
      await nextFrame()
      void element.offsetHeight
      styleRef.value.maxHeight = `${clampHeight}px`
    }
  }

  onBeforeUnmount(() => clearTimeout(releaseTimer))

  return { applyExpanded }
}
