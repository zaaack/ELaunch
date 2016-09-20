import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import { ActionTypes } from '../constants'
import deepKey from '../../../app/utils/deepKey'
import config from '../../../app/config'

function configReducer(state = { rawConfig: config.rawConfig}, action) {
  switch (action.type) {
    case ActionTypes.CHANGE_CONFIG:
      deepKey.set(state.rawConfig, action.key, action.value)
      break
    default:
  }
  return state
}

const rootReducer = combineReducers({
  configReducer,
  routing,
})

export default rootReducer
