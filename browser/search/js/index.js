/**
 * use .el-item-dom/.el-btn-dom to operate dom and .el-item/.btn to change style,
 * this could make develop plugin which need custom_view more easier, like custom
 * button style(e.g. emoji plugin shows emoji icons in grid view)
 */
const ipcRenderer = require('electron').ipcRenderer
const notifier = require('../../utils/notifier').initInRenderer()
const ui = require('./js/ui')
;(function () {
  document.querySelector('#el-search').addEventListener('keyup', function () {
    onExec(this.value)
  }, false)

  document.addEventListener('keyup', function (e) {
    let $inp = document.querySelector('#el-search')
    let cmd = $inp.value
    if (e.altKey && e.keyCode >= 49 && e.keyCode <= 57) { //输入数字
      let index = e.keyCode - 49
      $select = document.querySelectorAll('.el-item-dom')[index]
      onExecItem($select, cmd)
    } else { //l 37 u 38 r 39 d 40
      switch (e.keyCode) {
      case 38: //up
        ui.selectPrevItem()
        break
      case 40: //down
        ui.selectNextItem()
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
      default:
        break
      }
    }

  }, false)

  let lastCmd = ''
  function onEnter($inp, cmd) {
    if (cmd === lastCmd) {
      let $select = document.querySelector('.select');
      if (!$select) {
        $select = document.querySelector('.el-item-dom');
      }
      onExecItem($select, cmd)
    } else {
      onExec(cmd)
    }
  }

  function onExec(cmd) {
    if (cmd !== lastCmd) {
      ipcRenderer.send('exec', cmd)
      lastCmd = cmd
    }
  }

  function onExecItem($select, cmd) {
    if (!$select) return;
    let $btn = $select.querySelector('.btn-dom.select')
    let item = {
      value: $select.getAttribute('data-value'),
      opt: $btn?$btn.getAttribute('data-name'):null
    }
    console.log('exec-item', item, cmd);
    ipcRenderer.send('exec-item', {
      cmd: cmd,
      item: item
    })
  }
  ipcRenderer.on('exec-reply', (event, items) => {
    ui.renderItems(items)
    ipcRenderer.send('window-resize', {
      width: document.body.offsetWidth,
      height: document.body.offsetHeight
    })
  })

  ipcRenderer.on('exec-item-reply', (event, arg) => {
    document.querySelector('#el-search').value = ''
    document.querySelector('#el-items').innerHTML = ''
    ipcRenderer.send('hide')
  })
})()
