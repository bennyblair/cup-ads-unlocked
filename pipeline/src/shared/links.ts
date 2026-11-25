const EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export const mailHref = (email: string) => {
  const value = email.trim()
  if (!EMAIL.test(value) || value.length > 320) return null
  return `mailto:${value}`
}

export const telHref = (phone: string) => {
  const stripped = phone.trim()
  if (!stripped || stripped.length > 40) return null
  if (/[<>"'`]/.test(stripped) || /javascript/i.test(stripped) || /[a-z]/i.test(stripped.replace(/ext/gi, ""))) {
    return null
  }
  let digits = stripped.replace(/[^\d+]/g, "")
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`
  if (/^0[23478]\d{8}$/.test(digits)) digits = `+61${digits.slice(1)}`
  if (/^\+[1-9]\d{7,14}$/.test(digits) || /^[1-9]\d{7,14}$/.test(digits)) return `tel:${digits}`
  return null
}
