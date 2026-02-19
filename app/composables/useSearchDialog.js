export const useSearchDialog = () => {
  const isOpen = useState('searchDialogOpen', () => false)
  const { trackCtaClick } = useGtmTracking()

  const openDialog = () => {
    isOpen.value = true
    trackCtaClick({
      ctaId: 'search-dialog-open',
      ctaLabel: 'Ouvrir la recherche',
      ctaUrl: '#search',
    })
  }

  const closeDialog = () => {
    isOpen.value = false
  }

  const toggleDialog = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  }
}
