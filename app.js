'use strict'

//Entry point, set custom object in global
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

app.setName('Battery Watcher')
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  console.log('Quitting app...')
  app.quit()
})

// ENTRY POINT
app.on('ready', () => {

  // Setup
  const appIcon = new Tray(joinSafe(__dirname, 'icons', 'battery.png'))
  appIcon.setHighlightMode('always')

  const menu = Menu.buildFromTemplate( MENU_ITEMS )

  Menu.setApplicationMenu( menu )
  appIcon.setContextMenu( menu )

  if( !settings.get('first_time') ){
    settings.set('sample', joinSafe(__dirname, 'samples', 'rooster.mp3'))
  }

  // Start daemon
  require(joinSafe(__dirname, 'daemon')).start( settings.get('sample') )
})
