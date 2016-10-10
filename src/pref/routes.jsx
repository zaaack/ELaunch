import React from 'react'
import Main from './containers/Main'
import General from './components/General'
import Shortcuts from './components/Shortcuts'

const container = (props) => props.children

export default {
  path: '/',
  component: Main,
  indexRoute: { onEnter: (nextState, replace) => replace('/global/general') },
  childRoutes: [{
    path: 'global',
    text: 'Global',
    component: container,
    childRoutes: [{
      path: 'general', // 样式
      component: General,
      text: 'General',
    }, {
      path: 'shortcuts',
      text: 'Shortcuts',
      component: Shortcuts,
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
