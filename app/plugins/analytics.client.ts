export default defineNuxtPlugin(() => {
  const cookie = useCookie('odysway_employee_optout')
  const isEmployee = cookie.value === '1'

  if (isEmployee) {
    return // stop initializing GA/Algolia/other trackers
  }

  // init trackers here
})
