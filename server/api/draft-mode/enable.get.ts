export default defineEventHandler(async (event) => {
  const { redirect } = getQuery(event)
  setCookie(event, 'sanity-draft-mode', '1', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return sendRedirect(event, (redirect as string) || '/')
})
