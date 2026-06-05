export default function (number, style = 'decimal', unit, type = 'cent', minimumIntegerDigits = 1, maximumFractionDigits = 2) {
  const options = { minimumIntegerDigits, maximumFractionDigits }

  const formatedNumber = `${new Intl.NumberFormat('fr-FR', options).format(type === 'cent' ? number / 100 : number)} ${style !== 'decimal' ? unit : ''}`

  return formatedNumber.trim()
}

// Formats an EUR amount already expressed in euros (not cents). Used across the BMS
// margins/invoices/dashboard surfaces — extracted from 4 inline duplicates.
export function formatEur(amount, { fallback = '—' } = {}) {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(Number(amount))) return fallback
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

// Same as formatEur but with an explicit sign prefix (+/− for non-zero).
// Used for variance / delta displays.
export function formatEurSigned(amount, { fallback = '—' } = {}) {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(Number(amount))) return fallback
  const formatted = formatEur(Math.abs(amount))
  return amount > 0 ? `+${formatted}` : amount < 0 ? `−${formatted}` : formatted
}
