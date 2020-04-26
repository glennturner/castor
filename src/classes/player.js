class Player {
  #playerId = 'player'
  #playerInterfaceId = 'player-ui'
  #playerUI
  #stateKey = 'C-PS'
  #timeElapsed = 0
  // Only update via `playing` event every five seconds.
  // @see `Player#_setCurrentTime`
  #timeElapsedThreshold = 5

  constructor (episodeId = undefined, opts = {}) {
    this.audioPlayer = document.getElementById(this.#playerId)
    this.#playerUI = document.getElementById(this.#playerInterfaceId)
    this.playing = false

    this.state = this.state || {}

    this.state.episode = episodeId || this.state.episodeId

    if (this.state.episodeId) {
      this.state.podcast = this.episode.podcastId
      this._updateGlobalPlayerUI()
    }

    this._setEvents()
  }

  get episode () {
    return this.podcast.getEpisodeById(this.state.episodeId)
  }

  set episode (episodeId) {
    // Ep has changed, so reset elapsed time and reset play state.
    if (!this.episode || this.episode.id != episodeId) {
      this.#timeElapsed = 0
      this.playing = false
    }

    let state = this.state
    state.episodeId = episodeId

    this.state = state
    this.podcast = this.episode.podcastId
    this.audioPlayer.src = this.episode.episodeUrl
    if (this.episode.state.currentTime) {
      this.audioPlayer.currentTime = this.episode.state.currentTime
    }

    this._updateGlobalPlayerUI()
  }

  get podcast () {
    return Podcast.get(this.state.podcastId)
  }

  set podcast (podcastId) {
    let state = this.state
    state.podcastId = podcastId

    this.state = state
  }

  get state () {
    return JSON.parse(
      localStorage.getItem(this.#stateKey)
    )
  }

  set state (obj) {
    localStorage.setItem(
      this.#stateKey,
      JSON.stringify({
        episodeId: obj.episodeId,
        podcastId: obj.podcastId
      })
    )
  }

  playEpisode (ep) {
    this.podcast = ep.podcastId
    this.episode = ep.id

    this.audioPlayer.src = this.episode.episodeUrl

    if (this.playing) {
      // Pause event is only triggered upon clicking the audio player pause,
      // so we fake playing here.
      this.playing = false
      this.audioPlayer.pause()
    } else {
      this.audioPlayer.play()
    }
  }

  /* Private */
  _updateGlobalPlayerUI () {
    document.getElementById(
      'podcast-display-name'
    ).innerHTML = `
    ${this.episode.title}<br />${this.episode.podcast.title} &ndash; ${this.episode.pubDate}
    `
  }

  _setCurrentTime (currentTime) {
    this.#timeElapsed = currentTime
    this.episode.currentTime = currentTime
  }

  _setEvents () {
    this.audioPlayer.addEventListener('play', () => {
      this.playing = true
    })

    this.audioPlayer.addEventListener('pause', () => {
      this.playing = false
    })

    this.audioPlayer.addEventListener('timeupdate', (e) => {
      let currentTime = e.target.currentTime

      // Throttle updates
      if (this._shouldUpdateCurrentTime(currentTime)) {
        this._setCurrentTime(currentTime)
      }
    })
  }

  _shouldUpdateCurrentTime (currentTime) {
    return (currentTime - this.#timeElapsed) > this.#timeElapsedThreshold
  }
}
