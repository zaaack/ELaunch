const os = require('os')
const fs = require('fs-extra')
const electron = require('electron')
const { merge } = require('../utils/merge')
const deepKey = require('../utils/deepKey')
const ElectronBus = require('../utils/ElectronBus')
const config = new ElectronBus('config')

const debug = process.argv.some((value)=>value.includes('--debug'))
const dataPath = `${os.homedir()}/.ELaunch`
const userConfigFile = dataPath+'/config.js'
let rawConfig


function loadConfig() {
  if (!fs.existsSync(userConfigFile)) {
    try {
      fs.copySync(__dirname+'/config.user.js', userConfigFile)
    } catch (err) {
      console.error(err)
    }
  }

  const userConfig = eval(fs.readFileSync(userConfigFile, 'utf8'))
  rawConfig = merge({}, require('./config.default.js'), userConfig)
  return this
}
Object.assign(config,  {
  dataPath,
  userConfigFile,
  merge,
  debug,
  loadConfig,
  get rawConfig() {
    return merge({}, rawConfig)
  },
  get(key, defaultValue) {
    return deepKey.get(rawConfig, key, defaultValue)
  },
  set(key, value) {
    deepKey.set(rawConfig, key, value)
  },
  context: {
    mainWindow: null,
    notifier: require('../utils/notifier')
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
    return name in rawConfig
      ? rawConfig[name]
      : target[name]
  }
})
