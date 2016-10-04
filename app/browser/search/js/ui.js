const { $, $$ } = require('../../utils/dom-util')
const ipcRenderer = require('electron').ipcRenderer

function selectBtn(n, $selItem = document) {
  const $btns = [].slice.call($selItem
    .querySelectorAll('.js-item.select .btn'))
  if ($btns.length === 0) return
  const prevIndex = $btns.findIndex($btn => $btn.classList.contains('select'))
  if (prevIndex >= 0) {
    $btns[prevIndex].classList.remove('select')
  }
  let $selBtn = n
  switch (n) {
    case -1:
      $selBtn = $btns[(prevIndex - 1 + $btns.length) % $btns.length]
      break;
    case 1:
      $selBtn = $btns[(prevIndex + 1) % $btns.length]
      break;
    default:
  }
  $selBtn.classList.add('select')
}


function bindFocusEvents() {
  // select item on Tab
  $.on('focus', (e) => {
    const target = e.target
    const classList = target.classList
    if (classList.contains('js-focusable')) {
      $$('.js-item').forEach(
        itemEl => itemEl.classList.remove('select'))
      if (classList.contains('js-item')) {
        classList.add('select')
      }
    } else if (classList.contains('js-btn')) {
      selectBtn(target)
    }
  }, true)

  // auto focus in shown
  window.addEventListener('focus', () => {
    $('#search-input').focus()
  })
}

bindFocusEvents()

const isSelectedItem = $el =>
  $el === document.activeElement
  || $el.classList.contains('select')
module.exports = {
  selectNextItem() {
    const $items = $$('.js-focusable')
    const prevIndex = $items.findIndex(isSelectedItem)
    const $selItem = $items[(prevIndex + 1) % $items.length]
    $selItem.focus()
  },
  selectPrevItem() {
    const $items = $$('.js-focusable')
    const prevIndex = $items.findIndex(isSelectedItem)
    const $selItem = $items[(prevIndex - 1 + $items.length) % $items.length]
    $selItem.focus()
  },
  selectNextItemOpt() {
    selectBtn(1)
  },
  selectPrevItemOpt() {
    selectBtn(-1)
  },
  renderItems(items) {
    const $itemUl = $('#items')
    $itemUl.innerHTML = `${items.map((item, index) => {
      let innerView = item.custom_view
      if (!item.custom_view) {
        innerView = `
              <img class="icon" src="${item.icon}"/>
              <div class="info">
                <div class="name">${item.name}<span class="key">Alt+${index + 1}</span></div>
                <div class="detail">
                  ${item.detail
                    ? item.detail
                    : '&nbsp;'
                }</div>
              </div>
              ${item.opts
                ? `<div class="btn-group">
                    ${item.opts.map((opt, optIndex) =>
                      `<button class="btn js-btn color-${optIndex} ${
                        optIndex === 0 ? 'select' : ''
                      }" data-name="${opt.name}">${opt.label}</button>`
                    ).join('')}
                  </div>`
                : ''}`
      }
      return `
            <li class="item js-item js-focusable" tabindex="0" data-index='${index}'>
              ${innerView}
            </li>`
    }).join('')}`
  },
  resizeWindow() {
    ipcRenderer.send('window-resize', {
      height: document.body.offsetHeight,
    })
  },
}
