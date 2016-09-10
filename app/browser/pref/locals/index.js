const fs = require('fs')
const defaultLocal = require('./en')

let local = defaultLocal
let localName = 'en'

/* disable eslint global-require */
function getLocal(local) {
  const localFile = `./${local}`
  if (fs.existsSync(localFile)) {
    return require(localFile)
  }
  return null
}

export function setLocal(name) {
  local = getLocal(name)
  localName = name
  if (local) return
  if (name.includes('-')) {
    localName = name.match(/(\w+)\-/)[1]
    local = getLocal(name)
    if (local) return
  }
  local = defaultLocal
}

export function t(key, defaults, filter = f => f) {
  if (local && local[key]) {
    return filter(local[key] || defaultLocal[key])
  }
  console.error(`${local} don't have prop '${prop}'`)
  return void 0
}
export default new Proxy({
  local: defaultLocal,
  setLocal(local) {
    this.local = getLocal(local)
    if (this.local) return
    if (local.includes('-')) {
      this.local = getLocal(local.match(/(\w+)\-/)[1])
      if (this.local) return
    }
    this.local = defaultLocal
  },
}, {
  get(obj, prop) {
    if (obj.local && obj.local[prop]) {
      return obj.local[prop] || defaultLocal[prop]
    }
    console.error(`${obj.local} don't have prop '${prop}'`)
    return void 0
  },
})
