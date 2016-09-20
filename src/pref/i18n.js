import i18n from 'i18next'
import Backend from 'i18next-node-fs-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

const localesDir = 'locales'
let localesPath = `./${localesDir}`

console.log(process.cwd())
if (process.env.NODE_ENV === 'development') {
  localesPath = `${process.cwd()}/app/browser/pref/${localesDir}`
}

const backendOptions = {
  // path where resources get loaded from
  loadPath: `${localesPath}/{{lng}}/{{ns}}.json`,

  // path to post missing resources
  addPath: `${localesPath}/{{lng}}/{{ns}}.missing.json`,

  // jsonIndent to use when storing json files
  jsonIndent: 2,
}


i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: backendOptions,
    saveMissing: true,
    saveMissingTo: 'all',
    missingKeyHandler(lng, ns, key, fallbackValue) {
      // write missing key to all locales
    },

    // have a common namespace used around the full app
    ns: ['common'],
    defaultNS: 'common',

    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      // escapeValue: false // not needed for react!!
    },
  })


export default i18n
