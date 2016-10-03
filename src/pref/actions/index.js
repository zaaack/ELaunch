import { ActionTypes } from '../constants'
import config from '../../../app/config'
import dotDrop from 'dot-prop'

export function changeConfig(key, value) {
  return {
    type: ActionTypes.CHANGE_CONFIG,
    key,
    value,
  }
}

export function updateConfig(changedKeySet, rawConfig) {
  const failedKeys = []
  changedKeySet.forEach(key => {
    const value = dotDrop.get(rawConfig, key)
    const changed = config.set(key, value)
    if (!changed) {
      failedKeys.push(key)
    }
  })
  return {
    type: ActionTypes.UPDATE_CONFIG,
    failedKeys,
  }
}
