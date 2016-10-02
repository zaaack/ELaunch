import React, { PropTypes } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { changeConfig, updateConfig } from '../actions'
import { ActionTypes } from '../constants'
import config from '../../../app/config'

function mapStateToProps(state) {
  return {
    ...state.config,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    changeConfig,
    updateConfig,
  }, dispatch)
}

export function configForm(Component) {
  return compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(null, { bindI18n: ''})
  )(Component)
}

export const configFormProptypes = {
  t: PropTypes.func.isRequired,
  changeConfig: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  rawConfig: PropTypes.object.isRequired,
  failedKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
}
