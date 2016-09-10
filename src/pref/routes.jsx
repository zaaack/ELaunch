import React from 'react'
import Main from './containers/Main'

const container = (props) => props.children

export default {
  path: '/',
  component: Main,
  indexRoute: { component: container },
  childRoutes: [{
    path: 'global',
    text: 'Global',
    component: container,
    childRoutes: [{
      path: 'general', // 样式
      component: container,
      text: 'General',
    }, {
      path: 'keymap',
      text: 'Keymap',
      component: container,
    }],
  }, {
    path: 'plugins',
    text: 'Plugins',
    component: container,
    childRoutes: [{
      path: 'installed',
      text: 'Installed Plugins',
      component: container,
    }, {
      path: 'available',
      text: 'Available Plugins',
      component: container,
    }, {
      path: 'themes',
      text: 'Themes',
      component: container,
    }],
  }],
}
