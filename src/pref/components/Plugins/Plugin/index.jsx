import styles from './style.scss'
import electron from 'electron'
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import autoBind from 'autobind-decorator'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Checkbox from 'react-toolbox/lib/checkbox'
import Table from 'react-toolbox/lib/table'
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
import ConfirmButton from '../../Common/ConfirmButton'

import { languages, CENTER, CUSTOM, BUILT_IN } from '../../../constants'
import { BaseConfigForm, configForm, configFormProptypes } from '../../ConfigForm'
import { $, $$ } from '../../../../../app/browser/utils/dom-util'
import { BasePluginForm } from './PluginForm'
import pluginMgr from '../pluginMgr'

class Plugin extends BaseConfigForm {

  static propTypes = configFormProptypes

  static contextTypes = {
    routerContext: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)

    autoBind(this.constructor)
    const { routerContext: { params } } = context
    this.name = params.name
    const { t, rawConfig, defaultConfig } = props
    const plugin = rawConfig.plugins[this.name]
    const pluginDir = plugin.path.replace(/\/index.js$/, '')
    if (plugin.type === BUILT_IN) {
      const req = require.context('../../../../../app/plugins/', true, /\.\/.*\/config\.ui$/)
      this.ConfigUI = req(`./${params.name}/config.ui`)
    } else {
      const req = require('node-require')
      this.ConfigUI = req(`${pluginDir}/config.ui.js`)(BasePluginForm)
    }
  }

  componentWillMount() {
    const { config, rawConfig, t } = this.props
  }

  render() {
    const { t, rawConfig, defaultConfig, config } = this.props

    const plugin = rawConfig.plugins[this.name]
    const title = `${plugin.name}@${plugin.version || '0.0.0'}`
    return (
      <div>
        <div className={styles.header}>
          <IconButton icon="keyboard_arrow_left" mini className={styles.backBtn} />
          <span>{title}</span>
          {super.render()}
        </div>
        <blockquote>
          {plugin.description || title}
        </blockquote>
        <section>
          <Dropdown
            auto
            label={t('Choose Command')}
            onChange={this.handleChangePosition}
            source={Object.keys(plugin.commands).map(key => ({
              label: key,
              value: key
            }))}
            value={1}
          />
        </section>
        <section>
          <Dropdown
            auto
            label={t('Choose Platform')}
            onChange={this.handleChangePosition}
            source={Object.keys(plugin.commands).map(key => ({
              label: key,
              value: key
            }))}
            value={1}
          />
        </section>
        <section>
          <this.ConfigUI plugin={config.merge({}, plugin.config, plugin.commands[1])} />
        </section>
      </div>
    )
  }
}


export default configForm(Plugin)
