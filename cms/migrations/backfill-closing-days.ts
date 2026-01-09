import {at, defineMigration, setIfMissing} from 'sanity/migrate'

export default defineMigration({
  title: 'Backfill closingDays to 30',
  documentTypes: ['voyage'], // your document type name

  migrate: {
    document(doc) {
      return at('closingDays', setIfMissing(30))
    },
  },
})