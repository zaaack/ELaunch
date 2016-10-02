function mirror(obj) {
  /* eslint-disable no-param-reassign, no-sequences */
  return Object.keys(obj).reduce((o, key) => {
    o[key] = key
    return o
  }, obj)
}

export const ActionTypes = mirror({
  CHANGE_CONFIG: null,
})
