const fs = require('fs-extra')
const i18n = require('i18next')
const isRenderer = require('is-electron-renderer')
const Backend = require('i18next-node-fs-backend')
const electron = require('electron')
const { dataPath } = require('./constants')

const localesPathBuiltin = `${__dirname}/locales`
const localesPathProd = `${dataPath}/locales`
let localesPath = `${dataPath}/locales`

if (process.env.NODE_ENV === 'development') {
  localesPath = localesPathBuiltin
  if (isRenderer) {
    localesPath = './app/locales'
  }
}

if (!fs.existsSync(localesPath)) {
  fs.copySync(localesPathBuiltin, localesPath, e => console.error(e))
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
  .init({
    lng: 'en',
    lngs: ['en', 'zh'],
    fallbackLng: 'en',
    backend: backendOptions,
    saveMissing: true,
    saveMissingTo: 'all',
    // missingKeyHandler(lng, ns, key, fallbackValue) {
    //   // write missing key to all locales
    // },

    // have a common namespace used around the full app
    ns: ['common'],
    defaultNS: 'common',

    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      // escapeValue: false // not needed for react!!
    },
  })


module.exports = i18n
