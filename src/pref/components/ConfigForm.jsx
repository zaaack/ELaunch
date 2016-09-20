import React, { PropTypes } from 'react'
import { deepKey } from '../../../app/utils/deepKey'
import { compose } from 'redux'
import { ActionTypes } from '../constants'
import { config } from '../../../app/config/index'

export default class ConfigForm extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }
  state = {
    changedKeys: [],
    rawConfig: config.rawConfig,
  }

  handleChange(key, value) {
    this.props.dispatch({
      type: ActionTypes.CHANGE_CONFIG,
      key,
      value,
    })
  }

  dispatchConfig() {
  }
}
