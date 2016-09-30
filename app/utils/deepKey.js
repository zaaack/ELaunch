const { merge, getType } = require('./merge')

module.exports = {
  get(obj, key, defaultValue) {
    return key.split('.').reduce((subObj, subKey) => {
      if (subObj === defaultValue) return subObj
      if (subKey in subObj) {
        return subObj[subKey]
      } else {
        return defaultValue
      }
    }, obj)
  },
  set(obj, key, value) {
    if (value === void 0) return
    const keys = key.split('.')
    let subObj = obj
    keys.forEach((key, index) => {
      const oldVal = subObj[key]
      if (index === keys.length - 1) {
        subObj[key] = value
      } else if (oldVal){
        subObj = oldVal
      } else {
        subObj[key] = {}
      }
    })
    return obj
  },
}
