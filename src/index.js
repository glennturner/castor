const {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  globalShortcut,
  Menu,
  MenuItem,
  shell,
  Tray,
  ipcMain
} = require('electron')

const contextMenu = require('electron-context-menu')

const path = require('path')
const http  = require('http')
const fs = require('fs')
const ncrypto = require('crypto')
const DOMParser = require('xmldom').DOMParser

const Itunes = require('./services/itunes')
const Podcast = require('./classes/podcast')
const Player = require('./classes/player')
const User = require('./classes/user')

const Prefs = require('./helpers/prefs.js')
let prefs = new Prefs

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

let mainWindow, tray

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 2300,
    height: 1000,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // macOS Dock.
  let dockIcon = path.join(__dirname, './assets/images/dock-icon.png')
  app.dock.setIcon(dockIcon)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/* Sandbox required modules */
ipcMain.on('hash', (event, str) => {
  let hashedStr = ncrypto.createHash('md5').update(str).digest('hex')
  mainWindow.webContents.send('hashed', hashedStr)
})

ipcMain.on('saveEpisode', (event, f) => {
  /*
  fs.readFile("path/to/file", (error, data) => {
    // Do something with file contents

    // Send result back to renderer process
    mainWindow.webContents.send("fromMain", responseObj)
  })
  */
})

ipcMain.on('parseXML', (event, str) => {
  str = new DOMParser().parseFromString(str)
  mainWindow.webContents.send('parsedXML', str)
})


ipcMain.on('openURL', (event, url) => {
  shell.openExternal(url)
})

function importOPML (e) {
  dialog.showOpenDialog(
    {
      filters: [
        {
          name: 'OPML Files',
          extensions: ['txt', 'xml', 'opml']
        }
      ],
      properties: ['openFile', 'multiSelections']
    }
  ).then((dialog) => {
    if (dialog.canceled) { return }

    for (let file of dialog.filePaths) {
      let xml = fs.readFileSync(file, 'utf-8')
      let parser = new DOMParser
      if (Itunes.isPlaylist(xml, parser)) {
        let playlist = Itunes.parsePlaylist(xml, parser)
      // OPML
      } else {
        console.error('Currently unsupported')
      }
    }
  })
}

function restoreBackup (e) {
  dialog.showOpenDialog(
    {
      filters: [
        {
          name: 'JSON Files',
          extensions: ['json']
        }
      ],
      properties: ['openFile']
    }
  ).then((dialog) => {
    if (dialog.canceled) { return }

    let db = fs.readFileSync(dialog.filePaths[0], 'utf-8')
    mainWindow.webContents.send('restoreBackup', JSON.parse(db))
  })
}

function reset (e) {
  let opts = {
    buttons: [ 'Yes', 'Cancel' ],
    message: 'Resetting the app will delete all stored content and reset all of your prefs. Are you sure you want to continue?'
  }

  dialog.showMessageBox(opts).then(resp => {
    if (resp.response === 0) {
      mainWindow.webContents.send('reset', true)
    }
  })
}

function exportBackup (e) {
  dialog.showSaveDialog(
    {
      defaultPath: '~/Podcasts ' + new Date().toUTCString() + '.json',
      filters: [
        {
          name: 'JSON Files',
          extensions: ['json']
        }
      ]
    }
  ).then((dialog) => {
    if (dialog.canceled) { return }

    mainWindow.webContents.send('exportBackup', dialog.filePath)
  })
}

function exportOPML (e) {
  dialog.showSaveDialog(
    {
      defaultPath: '~/Podcasts.opml',
      filters: [
        {
          name: 'OPML Files',
          extensions: ['txt', 'xml', 'opml']
        }
      ]
    }
  ).then((dialog) => {
    if (dialog.canceled) { return }

    mainWindow.webContents.send('exportOPML', dialog.filePath)
  })
}

ipcMain.on('saveOPML', (event, argvs) => {
  fs.writeFile(argvs.filename, argvs.xml, 'utf8', () => {})
})

ipcMain.on('saveBackup', (event, argvs) => {
  fs.writeFile(argvs.filename, argvs.json, 'utf8', () => {})
})

ipcMain.on('subscribeByUrl', (event, args) => {
  let hashedId = ncrypto.createHash('md5').update(args.url).digest('hex')

  mainWindow.webContents.send('subscribeByUrl', hashedId, args.url)
})

/* Menus */
const isMac = process.platform === 'darwin'

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Show By URL...',
        accelerator: 'CmdOrCtrl+Shift+A',
        click: () => {
          mainWindow.webContents.send('promptURL', true)
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Import OPML',
        accelerator: 'CmdOrCtrl+I',
        click: (e) => { importOPML(e) }
      },
      {
        label: 'Export OPML',
        accelerator: 'CmdOrCtrl+E',
        click: (e) => { exportOPML(e) }
      },
      {
        type: 'separator'
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Controls',
    submenu: [
      {
        label: 'Play/Pause',
        accelerator: 'Space',
        click: (e) => {
          mainWindow.webContents.send('togglePlay', true)
        }
      }
    ]
  },
  {
    label: 'Utilities',
    submenu: [
      {
        label: 'Backup',
        accelerator: 'CmdOrCtrl+B',
        click: exportBackup
      },
      {
        label: 'Restore from Backup',
        accelerator: 'CmdOrCtrl+/',
        click: restoreBackup
      },
      {
        type: 'separator'
      },
      {
        label: (
          'Show Debug Menu Options'
        ),
        accelerator: 'CmdOrCtrl+Shift+M',
        checked: prefs.getPref('debugMenuOpts'),
        type: 'checkbox',
        click: (e) => {
          prefs.togglePref('debugMenuOpts')
        }
      },
      {
        label: 'Reset (DEBUG)',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: reset
      },
      {
        label: 'Show Inspector (DEBUG)',
        accelerator: 'CmdOrCtrl+I',
        click: (e) => {
          mainWindow.webContents.openDevTools()
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
    template.unshift(
      {
        label: app.name,
        submenu:
        [
          {role: 'about'},
          {type: 'separator'},
          {role: 'services', submenu: []},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideothers'},
          {role: 'unhide'},
          {type: 'separator'},
          {role: 'quit'}
        ]
    }
  )
}

function setMenu () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
setMenu()

// Example context menu.
contextMenu({
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Rainbow',
			// Only show it when right-clicking images
			visible: params.mediaType === 'image'
		},
		{
			label: 'Search Google for “{selection}”',
			// Only show it when right-clicking text
			visible: params.selectionText.trim().length > 0,
			click: () => {
				shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`)
			}
		}
	]
})

app.whenReady().then(() => {
  globalShortcut.register('Cmd+Up', () => {
    mainWindow.webContents.send('togglePlay', true)
  })

})

ipcMain.on('prefs', (event, prefs) => {
  console.log('MAIN RECEIPVED PREFS')
  console.log(prefs)
})

ipcMain.on('disableSpace', (event) => {
  template[2].submenu[0].accelerator = 'CmdOrCtrl+Up'
  setMenu()
})

ipcMain.on('enableSpace', (event) => {
  template[2].submenu[0].accelerator = 'Space'
  setMenu()
})

ipcMain.on('sendToClipboard', (event, str) => {
  clipboard.writeText(str)
})

ipcMain.on('showEpCtxMenu', (event, epObj) => {
  const epMenu = new Menu()

  let playedAction = epObj.played ? 'Unplayed' : 'Played'
  let sendAction = `markAs${playedAction}`
  epMenu.append(
    new MenuItem ({
      label: `Mark as ${playedAction}`,
      click () {
        mainWindow.webContents.send(sendAction, epObj)
      }
    })
  )

  // Add JSON opt
  if (prefs.getPref('debugMenuOpts')) {
    epMenu.append(
      new MenuItem ({
        label: `Copy Ep JSON [DEBUG]`,
        click () {
          mainWindow.webContents.send('debugEpJSON', epObj)
        }
      })
    )
  }

  epMenu.popup(mainWindow)
})

