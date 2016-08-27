/**
 * use .el-item-dom/.el-btn-dom to operate dom and .el-item/.btn to change style,
 * this could make develop plugin which need custom_view more easier, like custom
 * button style(e.g. emoji plugin shows emoji icons in grid view)
 */
const ipcRenderer = require('electron').ipcRenderer
const notifier = require('../../utils/notifier').initInRenderer()
const ui = require('./js/ui')

let lastCmd = ''
let _items = []

function onExec(cmd) {
  if (cmd !== lastCmd) {
    ipcRenderer.send('exec', {
      cmd: cmd
    })
    lastCmd = cmd
  }
}
function onExecItem($select, cmd) {
  if (!$select) return;
  let $btn = $select.querySelector('.btn-dom.select')
  let item = {
    value: _items[+$select.getAttribute('data-item-index')].value,
    opt: $btn?$btn.getAttribute('data-name'):null
  }
  ipcRenderer.send('exec-item', {
    cmd: cmd,
    item: item
  })
}

function onEnter($inp, cmd) {
  if (cmd === lastCmd) {
    let $select = document.querySelector('.el-item-dom.select');
    if (!$select) {
      $select = document.querySelector('.el-item-dom');
    }
    onExecItem($select, cmd)
  } else {
    onExec(cmd)
  }
}

function resizeWindow() {
  ipcRenderer.send('window-resize', {
    height: document.body.offsetHeight
  })
}

function bindInputKeyUp() {
  document.querySelector('#el-search').addEventListener('keyup', function () {
    onExec(this.value)
  }, false)
}

function bindDocKeyUp() {
  document.addEventListener('keyup', function (e) {
    let $inp = document.querySelector('#el-search')
    let cmd = $inp.value
    if (e.altKey && e.keyCode >= 49 && e.keyCode <= 57) { //输入数字
      let index = e.keyCode - 49
      let $select = document.querySelectorAll('.el-item-dom')[index]
      onExecItem($select, cmd)
    } else { //l 37 u 38 r 39 d 40
      switch (e.keyCode) {
      case 38: //up
        ui.selectPrevItem()
        resizeWindow()
        break
      case 40: //down
        ui.selectNextItem()
        resizeWindow()
        break
      case 37: //left
        ui.selectPrevItemOpt()
        break
      case 39: //right
        ui.selectNextItemOpt()
        break
      case 13: //enter
        onEnter($inp, cmd)
        break
      case 8: //backspace
        document.querySelector('#el-search').focus()//auto jump to search input after pressed backspace
      default:
        break
      }
    }
  })
}

function bindIpcEvents() {
  ipcRenderer.on('exec-reply', (event, items) => {
    _items = items
    ui.renderItems(items)
    resizeWindow()
  })

  ipcRenderer.on('exec-item-reply', (event, arg) => {
    document.querySelector('#el-search').value = ''
    document.querySelector('#el-items').innerHTML = ''
    resizeWindow()
    ipcRenderer.send('hide')
  })
}

function bindEvents() {
   bindInputKeyUp()
   bindDocKeyUp()
   bindIpcEvents()
}

function init() {
  bindEvents()
}

init()
