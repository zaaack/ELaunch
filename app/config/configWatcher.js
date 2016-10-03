const electron = require('electron')
const i18n = require('../i18n')
const dotDrop = require('dot-prop')
const { fallbackLng } = require('../constants')
const promisify = require('../utils/promisify')

let config
let rawConfig

function setLanguage(ln, update = false) {
  console.log('set language', ln)
  if (ln === i18n.language) return
  i18n.changeLanguage(ln, err => {
    if (err && ln.includes('-')) {
      const ln2 = ln.match(/^([^-]+)-/)[1]
      setLanguage(ln2, true)
    }
    if (!update) return
    if (err) {
      config.set('language', fallbackLng)
    } else {
      config.set('language', ln)
    }
  })
}

function syncOnSet(key, value) {
  dotDrop.set(rawConfig, key, value)
  switch (key) {
    case 'language':
      setLanguage(value)
      break;
    default:
  }
}

function syncOnInit() {
  if (rawConfig.language) {
    setTimeout(() => { // waiting for react load to trigger event
      setLanguage(rawConfig.language)
    }, 500)
  }
}

module.exports = {
  init(_config) {
    config = _config
    rawConfig = config.getRawConfig()
    // notify all process to change config
    config.on('set-config', syncOnSet)
    syncOnInit()
  }
}
