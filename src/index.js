const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  Menu,
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
const User = require('./classes/user')

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

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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

function importOPML (e) {
  console.log('IMPORT OPML')
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
      console.log('OPEN FILE ' + file)
      if (Itunes.isPlaylist(xml, parser)) {
        console.log('IS ITUNES PLAYLIST')
        let playlist = Itunes.parsePlaylist(xml, parser)
        console.log(playlist)
      // OPML
      } else {
        console.error('Currently unsupported')
      }
    }
  })
}

function reset (e) {
  console.log('RESET!')
}

function backup (e) {
  console.log('BACKUP!')
}

function restore (e) {
  console.log('RESTORE!')
}

function exportOPML (e) {
  console.log('EXPORT OPML')
  console.log(e)
  dialog.showSaveDialog(
    {
      filters: [
        {
          name: 'OPML Files',
          extensions: ['txt', 'xml', 'opml']
        }
      ]
    }
  ).then((dialog) => {
    if (dialog.canceled) { return }

    User.exportOPML()
  })
}

/* Menus */
const isMac = process.platform === 'darwin'

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import OPML',
        click: (e) => { importOPML(e) }
      },
      {
        label: 'Export OPML',
        click: (e) => { exportOPML(e) }
      },
      {
        label: 'Backup',
        click: (e) => { backup(e) }
      },
      {
        label: 'Restore from Backup',
        click: (e) => { restore(e) }
      },
      {
        label: 'Reset (DEBUG)',
        click: (e) => { reset(e) }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
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

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

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

