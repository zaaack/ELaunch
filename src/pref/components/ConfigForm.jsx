import React, { PropTypes } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import autoBind from 'autobind-decorator'
import Dialog from 'react-toolbox/lib/dialog'
import dotDrop from 'dot-prop'
import { changeConfig, updateConfig } from '../actions'
import config from '../../../app/config'

const defaultConfig = config.getDefaultConfig()

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.failedKeys.length > 0) {
      this.handleToggle()
    }
  }

  // getPlatformConfig(baseKey, subKey, platform = process.platform) {
  //   const { rawConfig } = this.props
  //   const conf = dotDrop.get(rawConfig, baseKey)
  //   if (!conf) return null
  //   const platformVal = dotDrop.get(conf[platform], subKey)
  //   const defaultVal = dotDrop.get(conf.default, subKey)
  //
  //   let isDefault = false
  //   let value = ''
  //   if (platformVal != null) {
  //     value = platformVal
  //   } else if (defaultVal != null) {
  //     value = defaultVal
  //     isDefault = true
  //   }
  //   return { value, isDefault }
  // }

  handleToggle() {
    this.setState({ active: !this.state.active })
  }

  handleChange(key, func = f => f) {
    return value => {
      let selfValue = value
      if (value == null || value === '') {
        selfValue = dotDrop.get(defaultConfig, key)
      }
      this.props.changeConfig(key, func(selfValue))
    }
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
    defaultConfig,
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

BaseConfigForm.propTypes = ConfigFormProptypes
