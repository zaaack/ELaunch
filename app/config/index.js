const os = require('os')
const fs = require('fs-extra')
const isRenderer = require('is-electron-renderer')
const electron = require('electron')
const { merge } = require('../utils/merge')
const deepKey = require('../utils/deepKey')
const ElectronBus = require('../utils/ElectronBus')
const defaultConfig = require('./config.default.js')
const i18next = require('../i18n')
const { debug, dataPath, userConfigFile } = require('../constants')
const config = new ElectronBus('config')

let rawConfig = {}

Object.freeze(defaultConfig)

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

function writeConfig() {
  fs.outputJsonSync(userConfigFile, rawConfig, 'utf8')
}

Object.assign(config,  {
  dataPath,
  userConfigFile,
  debug,
  isRenderer,
  merge,
  loadConfig,
  writeConfig,
  get rawConfig() {
    return merge({}, rawConfig)
  },
  get(key, defaultValue) {
    return deepKey.get(rawConfig, key, defaultValue)
  },
  set(key, value) {
    try {
      writeConfig()
      deepKey.set(rawConfig, key, value)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
  context: {
    mainWindow: null,
    notifier: require('../utils/notifier'),
    i18next,
  },
  emitReload: function () {
    config.emit('reload-config')
    electron.BrowserWindow.getAllWindows()
      .forEach((win)=>win.webContents.send('reload-config'))
    return this
  }
})

loadConfig()
module.exports = new Proxy(config, {
  get(target, name) {
    return name in target
      ? target[name]
      : rawConfig[name]
  }
})
