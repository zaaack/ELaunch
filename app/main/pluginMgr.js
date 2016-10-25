const electron = require('electron')
const json5 = require('json5')
const child = require('child_process')
const fetch = require('isomorphic-fetch')
const co = require('co')
const config = require('../config')
const store = require('../utils/jsonStore')
const { pluginListUrl, appPath, dataPath } = require('../constants')
const promisify = require('../utils/promisify')

const { exec } = child

/**
 * load plugin list from remote
 * @return {[type]} [description]
 */
exports.loadPlugins = () =>
  fetch(pluginListUrl)
    .then(body => body.text())
    .then(text => json5.parse(text))
    .then(pluginList => {
      store.set('plugin-list', pluginList)
      return pluginList
    })

/**
 * load plugin list from local cache if exist, else load from remote
 * @return {[type]} [description]
 */
exports.getPlugins = () => {
  const pluginList = store.get('plugin-list')
  if (pluginList) {
    return Promise.resolve(pluginList)
  }
  return exports.loadPlugins()
}

const npm = `${appPath}/node_modules/.bin/npm`

function installPlugin(name) {
  return co(function* () {
    const pluginPath = `${dataPath}/node_modules/${name}`
    console.log('pluginPath', pluginPath, npm)
    try {
      yield promisify(exec)(`${npm} i ${name} --save --save-exact`, {
        cwd: dataPath })
      const defaultPluginConfig = require(`${pluginPath}/config.default.js`)
      config.set(`plugins.${name}`, {
        config: defaultPluginConfig.config,
        commands: defaultPluginConfig.commands,
      })
    } catch (e) {
      throw e
    }
  })
}

function uninstallPlugin() {
  return co(function* () {
    const pluginPath = `${dataPath}/node_modules/${name}`
    console.log('pluginPath', pluginPath, npm)
    try {
      yield promisify(exec)(`${npm} un ${name} --save`, {
        cwd: dataPath })
      const defaultPluginConfig = require(`${pluginPath}/config.default.js`)
      config.set(`plugins.${name}`, null)
    } catch (e) {
      throw e
    }
  })
}

exports.initInMain = () => {
  config.on('install-plugin', name => {
    installPlugin(name)
    .then(() => {
      config.emit(`install-plugin-success:${name}`)
    })
    .catch((e) => {
      config.emit(`install-plugin-error:${name}`, e)
    })
  })

  config.on('uninstall-plugin', name => {
    uninstallPlugin(name)
    .then(() => {
      config.emit(`uninstall-plugin-success:${name}`)
    })
    .catch((e) => {
      config.emit(`uninstall-plugin-error:${name}`, e)
    })
  })
}

exports.installPlugin = installPlugin
exports.uninstallPlugin = uninstallPlugin
