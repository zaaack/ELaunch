const React = require('react')
const electron = require('electron')

module.exports = ({PluginForm}) => {

  class ConfigUI extends PluginForm {
    render() {
      return (
        <div></div>
      )
    }
  }

  return ConfigUI
}
