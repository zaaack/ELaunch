const EventBus = require('./EventBus')
const electron = require('electron')

class MyBus extends EventBus {}

const myBus = new MyBus()
if (electron.ipcRenderer) {
  window.myBus = myBus
}

module.exports = myBus
