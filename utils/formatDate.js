import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'

dayjs.extend(customParseFormat)

export default function (date, format = 'DD MM YYYY') {
  return dayjs(date).locale('fr').format(format)
}
