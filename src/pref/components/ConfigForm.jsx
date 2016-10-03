import React, { PropTypes } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import autoBind from 'autobind-decorator'
import Dialog from 'react-toolbox/lib/dialog'
import { changeConfig, updateConfig } from '../actions'

export class BaseConfigForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      active: false,
    }
    // autoBind bug: can't use as decorator
    autoBind(this.constructor)

    const t = props.t
    this.actions = [
      { label: t('OK'), onClick: this.handleToggle },
    ]
  }

  handleToggle() {
    this.setState({ active: !this.state.active })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.failedKeys.length > 0) {
      this.handleToggle()
    }
  }

  handleChange(key, func = f => f) {
    return value => this.props.changeConfig(key, func(value))
  }

  handleUpdate() {
    const { changedKeySet, rawConfig } = this.props
    this.props.updateConfig(changedKeySet, rawConfig)
  }

  changeAndUpdate(key, delay = 0, func = f => f) {
    return value => {
      this.handleChange(key, func)(value)
      if (!delay) {
        this.handleUpdate()
      } else if (!this.updateTimer) {
        this.updateTimer = setTimeout(() => {
          this.handleUpdate()
          this.updateTimer = null
        }, 1000)
      }
    }
  }

  render() {
    const { t } = this.props
    return (
      <Dialog
        actions={this.actions}
        active={this.state.active}
        onEscKeyDown={this.handleToggle}
        onOverlayClick={this.handleToggle}
        title={t('Saving config failed!')}
      >
        <p>{t('Some field couldn\'t be saved!')}</p>
      </Dialog>
    )
  }
}


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

BaseConfigForm.PropTypes = ConfigFormProptypes
