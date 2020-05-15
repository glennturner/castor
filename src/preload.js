const {
  contextBridge,
  ipcRenderer
} = require('electron')

const Podcast = require('./classes/podcast')
const User = require('./classes/user')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        'exportOPML',
        'hash',
        'reset',
        'saveEpisode',
        'parseXML'
      ]

      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        'exportOPML',
        'hashed',
        'resetCompleted',
        'episodeSaved',
        'parsedXML'
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

