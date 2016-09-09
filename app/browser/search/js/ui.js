const { $, $$ } = require('../../utils/dom-util')

function getFocusableItems() {
  return [$('#search-input')]
    .concat([].slice.call($$('.js-item')))
}

function selectBtn(n, $selItem) {
  let $btns = [].slice.call(($selItem||document).querySelectorAll('.js-item.select .btn'))
  if ($btns.length === 0) return
  let prevIndex = $btns.findIndex($btn => $btn.classList.contains('select'))
  if (prevIndex >= 0){
    $btns[prevIndex].classList.remove('select')
  }
  let $selBtn = n
  switch (n) {
  case -1:
    $selBtn = $btns[(prevIndex- 1 + $btns.length) % $btns.length]
    break;
  case 1:
    $selBtn = $btns[(prevIndex + 1) % $btns.length]
    break;
  default:
  }
  $selBtn.classList.add('select')
}

function bindFocusEvents() {
  //select item on Tab
  $.on('focus', function (e) {
    console.log(e)
    if (e.target.classList.contains('js-item')) {
      [].slice.call($$('.js-item'))
        .forEach(item => item.classList.remove('select'))
      e.target.classList.add('select')
    }else if (e.target.classList.contains('js-btn')) {
      selectBtn(e.target)
    }
  }, true)

  // auto focus in shown
  window.addEventListener('focus', function () {
    $('#search-input').focus()
  })
}

bindFocusEvents()

let isSelectedItem = $el =>
  $el === document.activeElement ||
  $el.classList.contains('select')
module.exports = {
    selectNextItem: function () {
      let $fItems = getFocusableItems()
      let prevIndex = $fItems.findIndex(isSelectedItem)
      let $selItem = $fItems[(prevIndex + 1) % $fItems.length]
      $selItem.focus()
    },
    selectPrevItem: function () {
      let $fItems = getFocusableItems()
      let prevIndex = $fItems.findIndex(isSelectedItem)
      let $selItem = $fItems[(prevIndex - 1 + $fItems.length) % $fItems.length]
      $selItem.focus()
    },
    selectNextItemOpt: function () {
      selectBtn(1)
    },
    selectPrevItemOpt: function () {
      selectBtn(-1)
    },
    renderItems: function (items) {
        let $itemUl = $('#items')
        $itemUl.innerHTML = `${items.map((item, index)=>{
          return item.custom_view?
          `<li class="item js-item" tabindex="0" data-index='${index}'>
            ${item.custom_view}
          </li>`:

          `<li class="item js-item" tabindex="0" data-index='${index}'>
            <img class="icon" src="${item.icon}"/>
            <div class="info">
              <div class="name">${item.name}<span class="key">Alt+${index+1}</span></div>
              <div class="detail">${item.detail?item.detail:'&nbsp;'}</div>
            </div>
            ${item.opts?
              `<div class="btn-group">
                ${item.opts.map((opt,optIndex)=>
                  `<button class="btn js-btn color-${optIndex} ${optIndex===0?  `select`:``}" data-name="${opt.name}">${opt.label}</button>`
                ).join('')}
              </div>`:``}
          </li>`
        }).join('')}`
  }
}
