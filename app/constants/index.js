const os = require('os')

const debug = process.argv.some(value => value.includes('--debug'))
  || process.env.NODE_ENV === 'development'
const dataPath = `${os.homedir()}/.ELaunch`
const userConfigFile = `${dataPath}/config.json5`

module.exports = {
  debug,
  dataPath,
  userConfigFile,
  languages: [{
    value: 'zh',
    label: '简体中文',
  }, {
    value: 'en',
    label: 'English',
  }],
  fallbackLng: 'en',
}
