function getFocusable() {
  return [document.querySelector('#el-search')]
    .concat([].slice.call(document.querySelectorAll('.el-item')))
}

function selectBtn(n, $selItem) {
  let $btns = [].slice.call(($selItem||document).querySelectorAll('.el-item.select .btn'))
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


//select item on Tab
document.addEventListener('focus', function (e) {
  if (e.target.classList.contains('el-item')) {
    [].slice.call(document.querySelectorAll('.el-item'))
      .forEach(item => item.classList.remove('select'))
    e.target.classList.add('select')
  }else if (e.target.classList.contains('btn')) {
    selectBtn(e.target)
  }
}, true)

let itemIsSel = $el => $el === document.activeElement || $el.classList.contains('select')
module.exports = {
    selectNextItem: function () {
      let $fItems = getFocusable()
      let prevIndex = $fItems.findIndex(itemIsSel)
      let $selItem = $fItems[(prevIndex + 1) % $fItems.length]
      $selItem.focus()
    },
    selectPrevItem: function () {
      let $fItems = getFocusable()
      let prevIndex = $fItems.findIndex(itemIsSel)
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
        let $itemUl = document.querySelector('#el-items')
        console.log(items);
        $itemUl.innerHTML = `${items.map((item, index)=>{
          return item.custom_view?
          `<li class="el-item" tabindex="0" data-value='${item.value}'>
            ${item.custom_view}
          </li>`:

          `<li class="el-item" tabindex="0" data-value='${item.value}'>
            <img class="el-item-icon" src="${item.icon}"/>
            <div class="el-item-info">
              <div class="el-item-name">${item.name}<span class="el-item-key">Alt+${index+1}</span></div>
              <div class="el-item-detail">${item.detail}</div>
            </div>
            ${item.opts?
              `<div class="btn-group">
                ${item.opts.map((opt,optIndex)=>
                  `<button class="btn color-${optIndex} ${optIndex===0?  `select`:``}" data-name="${opt.name}">${opt.label}</button>`
                ).join('')}
              </div>`:``}
          </li>`
        }).join('')}`
  }
}
