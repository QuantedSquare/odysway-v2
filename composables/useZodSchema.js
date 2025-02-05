export default function () {
  return (schema) => {
    return (value) => {
      const validation = schema.safeParse(value)
      return validation.success || validation.error.issues[0].message
    }
  }
}
