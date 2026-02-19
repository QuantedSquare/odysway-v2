export const useSearchDialog = () => {
  const isOpen = useState('searchDialogOpen', () => false)

  const openDialog = () => {
    isOpen.value = true
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
