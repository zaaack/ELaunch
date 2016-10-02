const electron = require('electron')
const isRenderer = require('is-electron-renderer')
const ElectronBus = require('./ElectronBus')

const notifierBus = new ElectronBus('notifier')

function notify(title, options) {
  new Notification(title, options||{body:title})
}


module.exports = {
  initInRenderer () {
    notifierBus.on('notify', function (title, options) {
      console.log('notify', title, options)
      notify.call(this, title, options)
    })
    return this
  },
  notify (title, options) {
    if (isRenderer) { //in renderer process
      notify(title, options)
    } else {
      notifierBus.emit('notify', ...arguments)
    }
  }
}
