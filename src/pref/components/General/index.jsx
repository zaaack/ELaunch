import styles from './style.scss'
import electron from 'electron'
import React, { PropTypes } from 'react'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import Checkbox from 'react-toolbox/lib/checkbox'

import { languages, CENTER, CUSTOM } from '../../constants'
import { BaseConfigForm, configForm, configFormProptypes } from '../ConfigForm'

class General extends BaseConfigForm {

  static propTypes = configFormProptypes

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const { config, rawConfig, t } = this.props
    this.displays = this.getDisplays()
    this.positions = [{
      value: CENTER,
      label: t(CENTER),
    }, {
      value: CUSTOM,
      label: t(CUSTOM),
    }]
  }

  componentWillUpdate(nextProps, nextState) {
    this.componentWillMount()
  }

  getDisplays() {
    const displays = []
    const { rawConfig, t } = this.props
    const priDisplay = electron.screen.getPrimaryDisplay()
    displays.push({
      value: priDisplay.id,
      label: `${t('Primary display')} 1`,
    })
    electron.screen.getAllDisplays()
      .filter(d => d.id !== priDisplay.id)
      .forEach((disp, index) => {
        displays.push({
          value: disp.id,
          label: `${t('Display')} ${index + 2}`,
        })
      })

    if (!displays.find(d => d.value === rawConfig.display)) {
      this.changeAndUpdate('display', priDisplay.id)
    }
    return displays
  }

  handleChangePosition(value) {
    if (value === CENTER) {
      this.changeAndUpdate('position')(value)
    } else {
      this.changeAndUpdate('position')({ x: 0, y: 0 })
    }
  }

  renderPosition() {
    const { t, rawConfig } = this.props
    let position = rawConfig.position
    const isCustom = position && Number.isInteger(position.x)
      && Number.isInteger(position.y)
    position = isCustom ? CUSTOM : CENTER
    const els = [
      <section key="position_type">
        <Dropdown
          auto
          label={t('Set position')}
          onChange={this.handleChangePosition}
          source={this.positions}
          value={position}
        />
      </section>]
    if (position === CUSTOM) {
      els.push(
        <section className={styles.inlineGroup} key="position_pos">
          <Input
            type="number"
            label={t('Left')}
            value={rawConfig.position.x}
            onChange={this.changeAndUpdate('position.x', 1000, parseInt)}
            className={styles.inline2x}
          />
          <Input
            type="number"
            label={t('Top')}
            value={rawConfig.position.y}
            onChange={this.changeAndUpdate('position.y', 1000, parseInt)}
            className={styles.inline2x}
          />
        </section>
      )
    }

    return els
  }

  render() {
    const { t, rawConfig, defaultConfig } = this.props
    return (
      <div>
        <section className={styles.inlineGroup}>
          <Input
            type="number"
            label={t('Width')}
            value={rawConfig.width}
            hint={String(defaultConfig.width)}
            onChange={this.changeAndUpdate('width', 1000, parseInt)}
            className={styles.inline2x}
          />
          <Input
            type="number"
            label={t('Max height')}
            value={rawConfig.maxHeight}
            hint={String(defaultConfig.maxHeight)}
            onChange={this.changeAndUpdate('maxHeight', 1000, parseInt)}
            className={styles.inline2x}
          />
        </section>
        <section>
          <Dropdown
            auto
            label={t('Choose language')}
            onChange={this.changeAndUpdate('language')}
            source={languages}
            value={rawConfig.language}
          />
        </section>
        <section>
          <Dropdown
            auto
            label={t('Choose display')}
            onChange={this.changeAndUpdate('display', 0, parseInt)}
            source={this.displays}
            value={rawConfig.display}
          />
        </section>
        {this.renderPosition()}
        <section>
          <Checkbox
            checked={rawConfig.autoLaunch}
            label={t('Start at login')}
            onChange={this.changeAndUpdate('autoLaunch')}
          />
        </section>
        <section>
          <Checkbox
            checked={rawConfig.checkUpdate}
            label={t('Auto check update') + ' (Not finished yet!)'}
            onChange={this.changeAndUpdate('checkUpdate')}
          />
        </section>
        {super.render()}
      </div>
    )
  }
}

export default configForm(General)
