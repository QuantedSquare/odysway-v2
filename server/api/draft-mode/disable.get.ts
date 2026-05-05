export default defineEventHandler(async (event) => {
  const { redirect } = getQuery(event)
  deleteCookie(event, 'sanity-draft-mode')
  return sendRedirect(event, (redirect as string) || '/')
})
