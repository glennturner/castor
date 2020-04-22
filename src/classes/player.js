class Player {
  #currentTime
  #episode
  #history
  #player
  #playing = false
  #playerId = 'player'
  #playerInterfaceId = 'player-ui'
  #playerUI
  #stateKey = 'C-PS'

  constructor (episode = undefined, opts = {}) {
    if (episode) {
      this.episode = episode
    }

    this.#player = document.getElementById(this.#playerId)
    this.#playerUI = document.getElementById(this.#playerInterfaceId)
    this.#currentTime = opts.currentTime || 0

    this.state = this.state || {}

    if (this.state.podcastId) {
      this._populate()
    }
  }

  get playing () {
    return this.#playing
  }

  set playing (state) {
    this.#playing = state ? true : false

    this.episode.state = {
      currentTime: this.#currentTime
    }
  }

  get episode () {
    return this.#episode
  }

  set episode (ep) {
    this.#episode = ep

    this.#player.load()
  }

  get state () {
    return JSON.parse(
      localStorage.getItem(this.#stateKey)
    )
  }

  set state (state) {
    localStorage.setItem(
      this.#stateKey,
      JSON.stringify(state)
    )
  }

  play () {
    this.playing = true
    this.episode.playing = true

    this.#player.src = this.episode.episodeUrl
    this.#player.currentTime = this.#currentTime
    this._updateGlobalPlayerUI()

    this.#player.play()

    this.state = {
      podcastId: this.episode.podcast.id,
      episodeId: this.episode.id
    }
  }

  pause () {
    console.log('PAUSE!')
    console.log(this.episode)

    this.playing = false
    this.episode.pause = false

    this.#currentTime = this.#player.currentTime
    this.episode.currentTime = this.#currentTime

    this.#player.pause()

    this._updateState()
  }

  togglePlayback () {
    this.playing === true ? this.pause() : this.play()
  }

  /* Private */

  _populate () {
    let podcast = Podcast.get(this.state.podcastId)
    this.episode = podcast.getEpisodeById(this.state.episodeId)
    console.log('EPISODE')
    console.log(this.episode)

    this._updateGlobalPlayerUI()
  }

  _updateGlobalPlayerUI () {
    document.getElementById(
      'podcast-display-name'
    ).innerHTML = `
    ${this.episode.title}<br />${this.episode.podcast.title} &ndash; ${this.episode.pubDate}
    `
  }

  _setEvents () {
    this.#player.removeEventListener('play', this._onPlay)
    this.#player.removeEventListener('pause', this._onPause)

    this.#player.addEventListener('play', this._onPlay)
    this.#player.addEventListener('pause', this._onPause)
  }
}
