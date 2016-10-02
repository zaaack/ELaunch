import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import { ActionTypes } from '../constants'
import deepKey from '../../../app/utils/deepKey'
import config from '../../../app/config'

function configReducer(state = {
  rawConfig: config.getRawConfig(),
  failedKeys: [],
}, action) {
  const newState = { ...state }
  switch (action.type) {
    case ActionTypes.CHANGE_CONFIG:
      deepKey.set(newState.rawConfig, action.key, action.value)
      break
    case ActionTypes.UPDATE_CONFIG:
      // roll back failed keys
      action.failedKeys.forEach(key => {
        const originalVal = config.get(key)
        deepKey.set(newState.rawConfig, action.key, originalVal)
      })
      newState.failedKeys = action.failedKeys
      break
    default:
  }
  return newState
}

const rootReducer = combineReducers({
  config: configReducer,
  routing,
})

export default rootReducer
