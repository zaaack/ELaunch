const fs = require('fs-extra')
const { dataPath } = require('../constants')
const storePath = `${dataPath}/data/store.json`
let mStore

function loadStore() {
  if (!mStore) {
    mStore = fs.readJsonSync(storePath, { throws: false }) || {}
  }
}

function writeStore() {
  fs.outputJsonSync(storePath, mStore)
}

exports.get = (key, defaults = null) => {
  loadStore()
  return mStore[key] || defaults
}

exports.set = (key, value) => {
  if (value === null || value === void 0) {
    delete mStore[key]
  } else {
    mStore[key] = value
    writeStore()
  }
}
