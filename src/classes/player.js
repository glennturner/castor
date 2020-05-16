class Player {
  #playerId = 'player'
  #playerInterfaceId = 'player-ui'
  #playerUI
  #timeElapsed = 0

  static #stateKey = 'C-PS'

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
      this.src = this.episode.episodeUrl
      this.audioPlayer.currentTime = this.episode.currentTime || 0
      this._updateGlobalPlayerUI()
    }

    this._setEvents()
  }

  get episode () {
    return this.podcast.getEpisodeById(this.state.episodeId)
  }

  set episode (episodeId) {
    // Ep has changed, so reset elapsed time, reset play state, and refresh view.
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
    return Player.state()
  }

  set state (obj) {
    localStorage.setItem(
      Player.#stateKey,
      JSON.stringify({
        episodeId: obj.episodeId,
        podcastId: obj.podcastId
      })
    )

    if (this.podcast) {
      this.podcast.refreshView()
    }
  }

  get src () {
    return this.audioPlayer.src
  }

  set src (src) {
    this.audioPlayer.src = src
  }

  playEpisode (ep) {
    this._activateEp(this.state.episodeId, ep.id)

    this.podcast = ep.podcastId
    this.episode = ep.id

    this.src = this.episode.episodeUrl

    this.toggle()
  }

  pause () {
    // Pause event is only triggered upon clicking the audio player pause,
    // so we fake playing here.
    this.playing = false
    this.episode.playing = false
    this.audioPlayer.pause()
  }

  play () {
    this.episode.playing = true
    this.audioPlayer.play()
  }

  toggle () {
    if (this.playing) {
      this.pause()
    } else {
      this.play()
    }
  }

  /* Static */

  // Convenience method.
  static state() {
    return JSON.parse(
      localStorage.getItem(Player.#stateKey)
    ) || {}
  }

  /* Private */
  _activateEp(priorEpId, currentEpId) {
    let className = 'active'
    if (priorEpId && document.getElementById(priorEpId)) {
      document.getElementById(priorEpId).classList.remove(className)
    }

    let currentEp = document.getElementById(currentEpId)
    currentEp.classList.add(className)
  }

  _updateGlobalPlayerUI () {
    this.audioPlayer.focus()

    document.getElementById(
      'podcast-display-artwork-cont'
    ).innerHTML = `
      <img
        src="${this.episode.podcast.artwork}"
        class="artwork podcast-icon"
      >
    `

    document.getElementById(
      'podcast-display-title'
    ).innerHTML = `
      ${this.episode.title}
    `

    document.getElementById(
      'podcast-display-artist-name'
    ).innerHTML = `
      ${this.episode.podcast.title} &ndash; ${this.episode.pubDisplayDate()}
    `
  }

  _setCurrentTime (currentTime) {
    this.#timeElapsed = currentTime
    this.episode.currentTime = currentTime
  }

  _setEvents () {
    this.audioPlayer.removeEventListener('play', (e) => { this._setPlay(e) })
    this.audioPlayer.addEventListener('play', (e) => { this._setPlay(e) })

    this.audioPlayer.removeEventListener('pause', (e) => { this._setPause(e) })
    this.audioPlayer.addEventListener('pause', (e) => { this._setPause(e) })

    this.audioPlayer.removeEventListener('timeupdate', (e) => { this._onTimeUpdate(e) })
    this.audioPlayer.addEventListener('timeupdate', (e) => { this._onTimeUpdate(e) })

    this.audioPlayer.removeEventListener('blur', (e) => this._focusPlayer)
    this.audioPlayer.addEventListener('blur', (e) => this._focusPlayer)

    // @todo Improve audio player focus after blur. (For instance, after input element blur.)
  }

  _focusPlayer (e) {{
    console.log('FOCUS PLAYER')
    if (!e.relatedTarget || !(
      e.relatedTarget instanceof HTMLInputElement
    )) {
      e.target.focus()
    }
  }
  }

  // Should improve this, as invoking `audioPlayer.pause()` will cause a delayed offset.
  // But, for now, it's fine.
  _onTimeUpdate (e, forceUpdate = false) {
    let currentTime = e.target.currentTime

    // Throttle updates
    if (this._shouldUpdateCurrentTime(currentTime) || forceUpdate) {
      this._setCurrentTime(currentTime)
      this._expireCurrentEp(currentTime)
    }
  }

  _expireCurrentEp (currentTime) {
    let duration = this.audioPlayer.duration
    let threshold = duration * 0.05
    let priorPlayStatus = this.episode.played
    let expire = duration - currentTime <= threshold

    if (!this.episode.played) {
      this.episode.played = expire
    }

    if (priorPlayStatus != this.episode.played) {
      this.podcast.refreshView()
      user.refreshSubscriptions()
    }
  }

  _setPlay (e) {
    this.playing = true
    this._onTimeUpdate(e, true)
    this._showPause()
  }

  _setPause (e) {
    this.playing = false
    this._onTimeUpdate(e, true)
    this._showPlay()
  }

  _showPlay () {
    document.getElementById('play-icon').style.display = 'inline-block'
    document.getElementById('pause-icon').style.display = 'none'
  }

  _showPause () {
    document.getElementById('play-icon').style.display = 'none'
    document.getElementById('pause-icon').style.display = 'inline-block'
  }

  _shouldUpdateCurrentTime (currentTime) {
    return (currentTime - this.#timeElapsed) > this.#timeElapsedThreshold
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Player
}
