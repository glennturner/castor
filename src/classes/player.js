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

    this.#player.src = this.episode.episodeUrl
    console.log('SET PLAYING')
    console.log(this.#player.currentTime)
    this._updateGlobalPlayerUI()

    this.state = {
      podcastId: this.episode.podcast.id,
      episodeId: this.episode.id,
      currentTime: this.#currentTime
    }

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

    if (this.episode) {
      this.episode.state.currentTime = this.#currentTime
    }
  }

  play (e) {
    this.playing = true
    this.episode.playing = true
    console.log('PLAY EV')
    console.log(e)

    this.#player.play()
  }

  pause (e) {
    this.playing = false
    this.episode.playing = false

    console.log('PAUSE EV')
    console.log(e)
    console.log('CURR TIME: ')
    console.log(this.#player.currentTime)

    this.#player.pause()
  }

  togglePlayback () {
    this.playing === true ? this.pause() : this.play()
  }

  /* Private */

  _populate () {
    let podcast = Podcast.get(this.state.podcastId)
    this.episode = podcast.getEpisodeById(this.state.episodeId)

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
    this.#player.removeEventListener('play', this.play)
    this.#player.removeEventListener('pause', this.pause)

    this.#player.addEventListener('play', this.play)
    this.#player.addEventListener('pause', this.pause)
  }
}
