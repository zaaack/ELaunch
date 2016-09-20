const ElectronBus = require('./ElectronBus')
const electron = require('electron')

class MyBus extends ElectronBus {}

const myBus = new MyBus()
if (electron.ipcRenderer) {
  window.myBus = myBus
}

module.exports = myBus
