const {
  contextBridge,
  ipcMain,
  ipcRenderer
} = require('electron')

const Prefs = require('./helpers/prefs.js')
let prefs = new Prefs

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
        'disableSpace',
        'enableSpace',
        'hash',
        'openURL',
        'parseXML',
        'prefs',
        'reset',
        'saveBackup',
        'saveEpisode',
        'saveOPML',
        'showEpCtxMenu',
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
        'markAsPlayed',
        'markAsUnplayed',
        'parsedXML',
        'promptURL',
        'requestPrefs',
        'resetCompleted',
        'restoreBackup',
        'subscribeByUrl',
        'togglePref'
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
