'use strict'

//Entry point, set custom object in global
const notifier  = require('node-notifier')
const settings  = require('electron-settings')
const { joinSafe } = require('upath')

// ***************** Electron *****************
const { app, Menu, Tray } = require('electron')
// ********************************************
const preferences = console.log.bind(console)

const MENU_ITEMS = [
  {
    click: preferences,
    label: 'Preferences'
  }, {
    type: 'separator'
  }, {
    click: app.quit,
    label: 'Quit'
  }
]

// Quit when all windows are closed.
app.on('window-all-closed', app.quit)

// ENTRY POINT
app.on('ready', () => {

  // Setup
  const appIcon = new Tray(joinSafe(__dirname, 'icons', 'battery.png'))
  const menu = Menu.buildFromTemplate( MENU_ITEMS )

  Menu.setApplicationMenu( menu )
  appIcon.setContextMenu( menu )

  console.log('1')
  if( !settings.get('first_time') ){
    console.log('first time')
    settings.set('sample', joinSafe(__dirname, 'samples', 'rooster.mp3'))
  }

  console.log('2')
  // Start daemon
  require(joinSafe(__dirname, 'daemon')).start( settings.get('sample') )
})
