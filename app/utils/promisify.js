
function promisifyFunc(func, target) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      func.call(target || this, ...args, (err, ...args2) => {
        if (err) {
          reject(err)
        } else {
          resolve(...args2)
        }
      })
    })
  }
}

module.exports = function promisify(mod, _target) {
  if (typeof mod === 'function') {
    return promisifyFunc(mod, _target)
  }
  return new Proxy(mod, {
    get(target, name) {
      const val = target[name]
      if (typeof val === 'function'
          && !name.endsWith('Sync')) {
        return promisifyFunc(val, target)
      }
      return val
    },
  })
}
