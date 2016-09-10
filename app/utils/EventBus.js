const EventEmitter = require('events')
const electron = require('electron')

function sendToAllWindows(...args) {
  electron.BrowserWindow.getAllWindows()
    .forEach(win => win.webContents.send(...args))
}

module.exports = class EventBus extends EventEmitter {
  constructor(name='default') {
    super()
    this._name = name
    this._ipcChannel = `EventBus-${name}:`
    this._listenersMap = {}


    const ipcMain = electron.ipcMain
    if (ipcMain) {
      ipcMain.on(this._ipcChannel, (e, eventJson) => {
        const eventData = JSON.parse(eventJson)
        sendToAllWindows(this._ipcChannel, eventJson)
      })
    }

    const ipc = electron.ipcMain || electron.ipcRenderer
    ipc.on(this._ipcChannel, (e, eventJson) => {
      const eventData = JSON.parse(eventJson)
      const listeners = this._listenersMap[eventData] || []
      listeners.forEach(listener => {
        try {
          listener(...eventData.args)
        } catch (e) {
          console.error(e)
        }
      })
    })
  }

  on(event, listener) {
    this._listenersMap[event] = this._listenersMap[event] || []
    this._listenersMap[event].push(listener)
    super.on(event, listener)
  }

  emit(event, ...args) {
    const remote = electron.remote
    const ipcRenderer = electron.ipcRenderer
    const ipcArgs = [this._ipcChannel, JSON.stringify({
      event, args: Array.from(args)
    })]

    if (electron.ipcRenderer) { // renderer process
      ipcRenderer.send(...ipcArgs)
    } else { // main process
      sendToAllWindow(...ipcArgs)
      super.emit(event, ...args)
    }
  }

  removeListener(event, listener) {
    super.removeListener(event, listener)
    if (this._listenersMap[event]) {
      this._listenersMap[event] = this._listenersMap[event].filter(l => l !== listender)
    }
  }
}
