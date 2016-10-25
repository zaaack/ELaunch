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
import pluginMgr from '../pluginMgr'

class InstalledPlugins extends BaseConfigForm {

  static propTypes = configFormProptypes

  constructor(props) {
    super(props)

    autoBind(this.constructor)
  }

  componentWillMount() {
    const { config, rawConfig, t } = this.props
  }

  getSource(type, filter = f => true) {
    const { config, rawConfig, t } = this.props
    return Object.keys(rawConfig.plugins)
      .map(name => rawConfig.plugins[name])
      .filter(pl => pl.type === type && filter(pl))
      .sort((a, b) => a.name > b.name)
      .map(pl => {
        const plName = `${pl.name}@${pl.version || '0.0.0'}`
        return {
          name: (
            <div className={styles.pluginInfo}>
              <h1>{plName}</h1>
            </div>
          ),
          description: (
            <div className={`${styles.pluginInfo}`}>
              <h2>{pl.description || plName}</h2>
            </div>
          ),
          commands: Object.keys(pl.commands || { [pl.name]: {} }).join(' '),
          enable: (
            <input
              type="checkbox"
              checked={!!pl.enable}
              onChange={e =>
                this.changeAndUpdate(`plugins.${pl.name}.enable`)(
                  e.target.checked)}
            />),
          initOnStart: (
            <input
              type="checkbox"
              checked={!!pl.initOnStart}
              onChange={e =>
                this.changeAndUpdate(`plugins.${pl.name}.initOnStart`)(
                  e.target.checked)}
            />),
          operation: (
            <div>
              <Link to={`/plugins/plugin/${pl.name}`}>
                <IconButton icon="settings" mini />
              </Link>
              {type === CUSTOM && (
                <ConfirmButton
                  buttonComponent={IconButton}
                  onConfirm={this.uninstallPlugin}
                  icon="delete"
                  mini
                  disabled={pl.type === 'built-in'}
                  title={t('Warning')}
                  body={`${t('Are you sure to remove plugin')} ${pl.name}@${pl.version} ?`}
                />)}
            </div>
          ),
        }
      })
      .reduce((rows, row) => {
        rows.push(row)
        rows.push({
          description: row.description,
        })
        delete row.description
        return rows
      }, [])
  }

  renderPluginsTable(type) {
    const { t, rawConfig, defaultConfig } = this.props
    const source = this.getSource(type)

    return (
      <table className={styles.pluginTable}>
        <tr>
          <th>{t('Name')}</th>
          <th>{t('Commands')}</th>
          <th>{t('Enable')}</th>
          <th>{t('Init on start')}</th>
          <th>{t('Operation')}</th>
        </tr>
        {source.map(row => {
          if (row.description) {
            return <tr className={styles.row}><td colSpan={5}>{row.description}</td></tr>
          }
          return (
            <tr>
              {Object.keys(row).map(key => <td>{row[key]}</td>)}
            </tr>
          )
        })}
      </table>
    )
  }

  render() {
    const { t, rawConfig, defaultConfig } = this.props

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
            {this.renderPluginsTable(BUILT_IN)}
            <ListSubHeader caption={t('Custom Plugins')} />
            {this.renderPluginsTable(CUSTOM)}
          </List>
        </section>
        {super.render()}
      </div>
    )
  }
}

export default configForm(InstalledPlugins)
