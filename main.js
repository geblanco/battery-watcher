'use strict'

//Entry point, set custom object in global
const { joinSafe } = require('upath')

// ***************** Electron *****************
const { app, Menu, Tray } = require('electron')
// ********************************************
const sample = joinSafe(__dirname, 'samples', 'rooster.mp3')

const MENU_ITEMS = [
  {
    click: console.log.bind(console),
    label: 'Preferences'
  }, {
    type: 'separator'
  }, {
    click: app.quit.bind(app),
    label: 'Quit'
  }
]

let menu = null
let tray = null

app.setName('Battery Watcher')
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  console.log('Quitting app...')
  app.quit()
})

// ENTRY POINT
app.on('ready', () => {

  // Setup
  tray = new Tray(joinSafe(__dirname, 'icons', 'battery.png'))
  menu = Menu.buildFromTemplate( MENU_ITEMS )

  Menu.setApplicationMenu( menu )
  tray.setContextMenu( menu )
  tray.setHighlightMode('always')

  // Start daemon
  require(joinSafe(__dirname, 'daemon')).start( sample )
})
