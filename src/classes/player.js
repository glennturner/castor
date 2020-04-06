class Player {
  constructor (episode = undefined, opts = {}) {
    this.episode = episode

    this._playing = false
    this._playerId = 'player'
    this._playerInterfaceId = 'player-ui'
    this._player = document.getElementById(this._playerId)
    this._currentTime = opts.currentTime || 0
  }

  get playing () {
    return this._playing
  }

  set playing (state) {
    this._playing = state ? true : false
  }

  get episode () {
    return this._episode
  }

  set episode (ep) {
    this._episode = ep
    player.load()
  }

  play () {
    console.log('PLAY!')
    this.playing = true

    this._player.src = this._episode.episodeUrl
    this._player.currentTime = this._currentTime
    player.play()
  }

  pause () {
    this.playing = false

    let player = document.getElementById(this._playerId)
    this._currentTime = player.currentTime
    player.pause()

  }

  _setEvents () {
    this._player.removeEventListener('play', this._onPlay)
    this._player.removeEventListener('pause', this._onPause)

    this._player.addEventListener('play', this._onPlay)
    this._player.addEventListener('pause', this._onPause)
  }
}
