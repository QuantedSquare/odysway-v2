export default function (number, style = 'decimal', unit, type = 'cent', minimumIntegerDigits = 1, maximumFractionDigits = 2) {
  const options = { minimumIntegerDigits, maximumFractionDigits }

  const formatedNumber = `${new Intl.NumberFormat('fr-FR', options).format(type === 'cent' ? number / 100 : number)} ${style !== 'decimal' ? unit : ''}`

  return formatedNumber
}
