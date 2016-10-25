import React, { PropTypes } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import autoBind from 'autobind-decorator'
import Dialog from 'react-toolbox/lib/dialog'
import dotDrop from 'dot-prop'
import { changeConfig, updateConfig } from '../../../actions'
import config from '../../../../../app/config'

export class BasePluginForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      active: false,
    }
    // autoBind bug: can't use as decorator
    autoBind(this.constructor)
  }

  render() {
    const { t } = this.props
    return (null)
  }
}


function mapStateToProps(state) {
  return {
    ...state.config,
    config,
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
    translate()
  )(Component)
}

export const ConfigFormProptypes = {
  t: PropTypes.func.isRequired,
  changeConfig: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  rawConfig: PropTypes.object.isRequired,
  failedKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  changedKeySet: PropTypes.object.isRequired,
}

BasePluginForm.propTypes = ConfigFormProptypes
