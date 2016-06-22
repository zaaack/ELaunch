let electron = require('electron');

function notify(title, options) {
  new Notification(title, options||{body:title})
}


module.exports = {
  initInRenderer: function () {
    let ipcRenderer = electron.ipcRenderer
    ipcRenderer.on('notify', function (event, args) {
      console.log(args);
      notify.call(this,args[0],args[1])
    })
    return this
  },
  notify: function (title, options) {
    if (electron.ipcRenderer) { //in renderer process
      notify(title, options)
    } else {
      let allWins = require('electron').BrowserWindow.getAllWindows()
      if(allWins.length>0){
        allWins[0].webContents.send('notify', arguments)
      }else {
        console.error('[notifier] no window find');
      }
    }
  }
}
