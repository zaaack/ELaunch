const ipc = require('electron').ipcRenderer

function sendCmd(cmd) {
  ipc.send('cmd', cmd)
}

function onExec(cb) {
  ipc.on('exec', cb)
}
