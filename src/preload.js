const {
  contextBridge,
  ipcMain,
  ipcRenderer
} = require('electron')

const Dialogs = require('dialogs')

const Feed = require('./classes/feed')
const Podcast = require('./classes/podcast')
const User = require('./classes/user')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        'hash',
        'openURL',
        'parseXML',
        'reset',
        'saveBackup',
        'saveEpisode',
        'saveOPML',
        'togglePlay'
      ]

      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        'episodeSaved',
        'exportBackup',
        'exportOPML',
        'hashed',
        'parsedXML',
        'promptURL',
        'resetCompleted',
        'restoreBackup',
        'subscribeByUrl'
      ]

      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    }
  }
);

ipcRenderer.on('reset', (args) => {
  User.reset()
})

ipcRenderer.on('togglePlay', () => {
  // Encountering loading issues with Player (which relies on Podcast)
  // so we manually invoke play/pause here via the audio element.
  let audioPlayer = document.getElementById('player')

  if (audioPlayer.paused) {
    audioPlayer.play()
  } else {
    audioPlayer.pause()
  }
})

ipcRenderer.on('promptURL', (args) => {
  const dialogs = Dialogs()
    dialogs.prompt(
      'Enter a URL to add your subscribed podcasts below.',
      url => {
        ipcRenderer.send('subscribeByUrl', {
          url: url
        })
      }
    )
})
