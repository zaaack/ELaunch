
const $ = selector =>
  document.querySelector(selector)

const $$ = selector =>
  Array.prototype.slice.call(document.querySelectorAll(selector))

$.on = (event, selector, listener, capture=true) => {
  if (typeof selector === 'function') {
    capture = listener
    listener = selector
    selector = null
  }

  document.addEventListener(event, e => {
    let closest
    if (selector) {
      closest = e.target.closest(selector)
      if (!closest) return
    }
    listener.call(closest || this, e)
  }, capture)
}

module.exports = { $, $$ }
