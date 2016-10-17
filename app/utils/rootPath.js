const electron = require('electron')

const app = electron.app || electron.remote.app
const appPath = app.getAppPath()

if (appPath.includes('node_modules/electron')) {
  module.exports = `${process.cwd()}/app`
} else {
  module.exports = appPath
}
