import React from 'react'
import Main from './containers/Main'

const noop = () => null

export default {
  path: '/',
  component: Main,
  indexRoute: { component: noop },
  childRoutes: [{
    path: 'general',
    text: 'General',
    component: noop,
    childRoutes: [{
      path: 'appearance', // 样式
      component: noop,
      text: 'Appearance',
    }, {
      path: 'behavior',
      component: noop,
      text: 'Behavior',
    }, {
      path: 'keymap',
      text: 'Keymap',
      component: noop,
    }, {
      path: 'update',
      text: 'Update',
      component: noop,
    }],
  }, {
    path: 'plugins',
    text: 'Plugins',
    component: noop,
    childRoutes: [{
      path: 'installed',
      text: 'Installed Plugins',
      component: noop,
    }, {
      path: 'available',
      text: 'Available Plugins',
      component: noop,
    }, {
      path: 'themes',
      text: 'Install Themes',
      component: noop,
    }],
  }],
}
