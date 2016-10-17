import styles from './style.scss'
import electron from 'electron'
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Checkbox from 'react-toolbox/lib/checkbox'
import Table from 'react-toolbox/lib/table'
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
import ConfirmButton from '../../Common/ConfirmButton'

import { languages, CENTER, CUSTOM } from '../../../constants'
import { BaseConfigForm, configForm, configFormProptypes } from '../../ConfigForm'

class InstalledPlugins extends BaseConfigForm {

  static propTypes = configFormProptypes

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const { config, rawConfig, t } = this.props
  }

  getSource(type) {
    const { config, rawConfig, t } = this.props
    return Object.keys(rawConfig.plugins)
      .map(name => rawConfig.plugins[name])
      // .filter(pl => pl.type === type)
      .sort((a, b) => a.name > b.name)
      .map(pl => {
        const plName = `${pl.name}@${pl.version || '0.0.0'}`
        return {
          name: (
            <div className={styles.pluginInfo}>
              <h1>{plName}</h1>
              <h2>{pl.description || plName}</h2>
            </div>
          ),
          commands: Object.keys(pl.commands || { [pl.name]: {} }).join(' '),
          enable: !!pl.enable,
          initOnStart: !!pl.initOnStart,
          operation: (
            <div>
              <Link to="/plugins/installed/settings">
                <IconButton icon="settings" mini />
              </Link>
              <ConfirmButton
                buttonComponent={IconButton}
                onConfirm={this.removePlugin}
                icon="delete"
                mini
                disabled={pl.type === 'built-in'}
                title={t('Warning')}
                body={`${t('Are you sure to remove plugin')} ${pl.name}@${pl.version} ?`}
              />
            </div>
          ),
        }
      })
  }

  render() {
    const { t, rawConfig, defaultConfig } = this.props
    const pluginModel = {
      name: { type: Object, title: t('Name') },
      commands: { type: String, title: t('Commands') },
      enable: { type: Boolean, title: t('Enable'), onChange(row, key, value) {} },
      initOnStart: { type: Boolean, title: t('Init on start'), onChange(row, key, value) {} },
      operation: { type: Object, title: t('Operation') },
    }

    return (
      <div>
        <section>
          {/* <Dropdown
            auto
            label={t('Choose Default Plugin')}
            onChange={this.handleChangeDefaultPlugin}
            source={[]}
            value={this.state.platform}
          /> */}
        </section>
        <section>
          <Input
            type="text"
            label={t('Search')}
            icon="search"
            value={'aa'}
            onChange={this.searchPlugins}
          />
        </section>
        <section>
          <List>
            <ListSubHeader caption={t('Built-in Plugins')} />
            <Table
              model={pluginModel}
              selectable={false}
              multiSelectable={false}
              // onChange={this.handleChange}
              // onSelect={this.handleSelect}
              source={this.getSource()}
            />
            <ListSubHeader caption={t('Custom Plugins')} />
          </List>
        </section>
        {super.render()}
      </div>
    )
  }
}

export default configForm(InstalledPlugins)
