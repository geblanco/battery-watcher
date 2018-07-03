'use strict'

const { joinSafe } = require('upath')
const daemon = require(joinSafe(__dirname, 'daemon'))

// ***************** Electron *****************
const { app, Menu, Tray } = require('electron')
// ********************************************
const sample = joinSafe(__dirname, 'samples', 'rooster.mp3')

const stop = () => {
  console.log('Quitting app...')
  if( app ){
    daemon.stop(false, (err) => {
      app.quit()
    })
  }
}

const MENU_ITEMS = [
  {
    type: 'separator'
  }, {
    click: stop,
    label: 'Quit'
  }
]

let menu = null
let tray = null

app.setName('Battery Watcher')
// Quit when all windows are closed.
app.on('window-all-closed', () => stop)

// ENTRY POINT
app.on('ready', () => {
  // Setup
  tray = new Tray(joinSafe(__dirname, 'icons/battery.png'))
  menu = Menu.buildFromTemplate( MENU_ITEMS )

  Menu.setApplicationMenu( menu )
  tray.setContextMenu( menu )
  tray.setHighlightMode('always')

  // Start daemon
  daemon.start( sample )
})
