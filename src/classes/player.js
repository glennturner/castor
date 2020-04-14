class Player {
  #currentTime
  #playing
  #player
  #playerId
  #playerInterfaceId
  #playerUI
  #stateKey

  constructor (episode = undefined, opts = {}) {
    if (episode) {
      this.episode = episode
    }

    this.#playing = false
    this.#playerId = 'player'
    this.#playerInterfaceId = 'player-ui'
    this.#player = document.getElementById(this.#playerId)
    this.#playerUI = document.getElementById(this.#playerInterfaceId)
    this.#currentTime = opts.currentTime || 0

    this.#stateKey = 'castorPlayerState'
  }

  get playing () {
    return this.#playing
  }

  set playing (state) {
    this.#playing = state ? true : false
  }

  get episode () {
    return this._episode
  }

  set episode (ep) {
    this._episode = ep

    this.#player.load()
  }

  play () {
    this.playing = true
    this.episode.playing = true
    console.log('PODCAST:')
    console.log(this.episode.getPodcast())

    this.#player.src = this._episode.episodeUrl
    this.#player.currentTime = this.#currentTime
    this._updateGlobalPlayerUI()
    this.#player.play()

    this._updateState()
  }

  pause () {
    this.playing = false
    this.episode.playing = false

    this.#currentTime = this.#player.currentTime
    this.#player.pause()

    this._updateState()
  }

  togglePlayback () {
    this.playing === true ? this.pause() : this.play()
  }

  /* Private */

  _getPlayerState () {
    localStorage.getItem(this.#stateKey)
  }

  _updatePlayerState () {
    localStorage.setItem(this.#stateKey, this._state())
  }

  _updateGlobalPlayerUI () {
    document.getElementById(
      'podcast-display-name'
    ).innerText = this.episode.title
  }

  _setEvents () {
    this.#player.removeEventListener('play', this._onPlay)
    this.#player.removeEventListener('pause', this._onPause)

    this.#player.addEventListener('play', this._onPlay)
    this.#player.addEventListener('pause', this._onPause)
  }
}
