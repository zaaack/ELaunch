const os = require('os')

const debug = process.argv.some((value)=>value.includes('--debug'))
const dataPath = `${os.homedir()}/.ELaunch`
const userConfigFile = dataPath+'/config.js'

module.exports = {
  debug,
  dataPath,
  userConfigFile
}
