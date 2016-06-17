let electron = require('electron');
let ipcRenderer, isInWin = electron.ipcRenderer ? true : false

function notify(title, options) {
  new Notification(title, options)
}

if (isInWin) {
  ipcRenderer = electron.ipcRenderer
  ipcRenderer.on('notify', function (event, args) {
    notify.apply(this, args)
  })
}

module.exports = function (mainWin) {
  return function (title, options) {
    if (isInWin) {
      notify(title, options)
    } else {
      mainWin.webContents.send('notify', arguments)
    }
  }
}
