const os = require('os')
const fs = require('fs-extra')
const isRenderer = require('is-electron-renderer')
const electron = require('electron')
const { merge } = require('../utils/merge')
const deepKey = require('../utils/deepKey')
const ElectronBus = require('../utils/ElectronBus')
const notifier = require('../utils/notifier')
const defaultConfig = require('./config.default.js')
const i18n = require('../i18n')
const { debug, dataPath, userConfigFile } = require('../constants')
const config = new ElectronBus('config')

let rawConfig = {}

Object.freeze(defaultConfig)

function writeConfig() {
  fs.outputJsonSync(userConfigFile, rawConfig, 'utf8')
}

function writeDefaultConfig() {
  try {
    rawConfig = merge({}, defaultConfig)
    writeConfig()
  } catch (err) {
    console.error(err)
  }
}

function loadConfig() {
  const exist = fs.existsSync(userConfigFile)
  if (!exist) {
    writeDefaultConfig()
  } else {
    const userConfigStr = fs.readFileSync(userConfigFile, 'utf8')
    if (userConfigStr.trim().startsWith('module.exports')) {
      writeDefaultConfig()
    } else {
      rawConfig = merge({}, defaultConfig, JSON.parse(userConfigStr))
    }
  }
  return this
}

Object.assign(config, {
  dataPath,
  userConfigFile,
  debug,
  isRenderer,
  merge,
  tr: i18n.t,
  getRawConfig() {
    return merge({}, rawConfig)
  },
  get(key, defaultValue) {
    return deepKey.get(rawConfig, key, defaultValue)
  },
  set(key, value) {
    const originalVal = this.get(key)
    try {
      deepKey.set(rawConfig, key, value)
      writeConfig()
      // notify all process to change config
      config.emit('set-config', key, value)
      return true
    } catch (e) {
      deepKey.set(rawConfig, key, originalVal)
      console.error(e)
      return false
    }
  },
  context: {
    mainWindow: null,
    notifier,
  },
})

loadConfig()

function setLanguage(ln) {
  i18n.changeLanguage(ln, err => {
    if (err) {
      console.error(err)
      if (ln.includes('-')) {
        i18n.changeLanguage(ln.match(/^([^-]+)-/)[1], e => e && console.error(e))
      }
    }
  })
}

// notify all process to change config
config.on('set-config', (key, value) => {
  deepKey.set(rawConfig, key, value)
  switch (key) {
    case 'language':
      setLanguage(value)
      break;
    default:
  }
})

if (rawConfig.language) {
  setLanguage(rawConfig.language)
}

module.exports = new Proxy(config, {
  get(target, name) {
    return name in target
      ? target[name]
      : rawConfig[name]
  },
})
