const os = require('os')
const electron = require('electron')
const app = electron.app || electron.remote.app

exports.debug = process.argv.some(value => value.includes('--debug'))
  || process.env.NODE_ENV === 'development'
exports.dataPath = `${os.homedir()}/.ELaunch`
exports.userConfigFile = `${exports.dataPath}/config.json5`


exports.languages = [{
  value: 'zh',
  label: '简体中文',
}, {
  value: 'en',
  label: 'English',
}]
exports.fallbackLng = 'en'

exports.pluginListUrl = 'https://zaaack.github.io/ELaunch/plugin_list.json'


let appPath = app.getAppPath()
if (appPath.includes('node_modules/electron')) {
  appPath = `${process.cwd()}/app`
}
exports.appPath = appPath
