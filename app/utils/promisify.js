
function promisifyFunc(func, target) {
  return function () {
    return new Promise((resolve, reject) => {
      func.call(target || this, ...arguments, function (err, ...args) {
        if (err) {
          reject(err)
        } else {
          resolve(...args)
        }
      })
    })
  }
}

module.exports = function promisify(mod, target) {
  if (typeof mod === 'function') {
    return promisifyFunc(mod, target)
  } else {
    return new Proxy(mod, {
      get: function (target, name) {
        const val = target[name]
        if (typeof val === 'function'
            && !name.endsWith('Sync')) {
          return promisifyFunc(val, target)
        } else {
          return val
        }
      }
    })
  }
}
