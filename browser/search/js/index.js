const ipcRender = require('electron').ipcRenderer
const notify = require('../../utils/notify')()
let lastCmd = ''

bindEvents()

function bindEvents() {
  let $inp = document.querySelector('#el-search')
  $inp.addEventListener('keyup', function (e) {
    let cmd = $inp.value
    if (e.altKey && e.keyCode >= 49 && e.keyCode <= 57) { //输入数字
      let index = e.keyCode - 49
      $select = document.querySelectorAll('.el-item')[index]
      onExecItem($select, cmd)
    } else { //l 37 u 38 r 39 d 40
      switch (e.keyCode) {
      case 38: //up

        break
      case 13: //enter
        onEnter($inp, cmd)
        break
      default:
        onExec(cmd)
        break
      }
    }

  }, false)
}

function onEnter($inp, cmd) {
  if (cmd !== lastCmd) {
    onExec(cmd)
  } else {
    let $select = document.querySelector('.select');
    if (!$select) {
      $select = document.querySelector('.el-item');
    }
    onExecItem($select, cmd)
  }
}
function onExec(cmd) {
  ipcRender.send('exec', cmd)
  lastCmd = cmd
}
function onExecItem($select, cmd) {
  if (!$select) return;
  let item = $select.getAttribute('data-value')
  console.log('execItem',item,cmd);
  ipcRender.send('execItem', {
    cmd: cmd,
    item: item
  })
}
ipcRender.on('execReply', (event, items) => {
  let $itemUl = document.querySelector('#el-items')

  $itemUl.innerHTML = `${items.map((item, index)=>`<li class="el-item" data-value="${item.value}">
  <img class="el-item-icon" src="${item.icon}"/>
  <div class="el-item-info">
    <div class="el-item-name">${item.name}<span class="el-item-key">Alt+${index+1}</span></div>
    <div class="el-item-detail">${item.detail}</div>
  </div>
  <div class="el-item-opts">
  </div>
</li>`)}`
})

ipcRender.on('execItemReply', (event, arg)=>{
  ipcRender.send('hide')
})
