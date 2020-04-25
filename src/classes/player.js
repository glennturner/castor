class Player {
  #playerId = 'player'
  #playerInterfaceId = 'player-ui'
  #playerUI
  #stateKey = 'C-PS'

  constructor (episodeId = undefined, opts = {}) {
    this.audioPlayer = document.getElementById(this.#playerId)
    this.#playerUI = document.getElementById(this.#playerInterfaceId)

    this.state = this.state || {}

    this.state.episode = episodeId || this.state.episodeId

    if (this.state.episodeId) {
      this.state.podcast = this.episode.podcastId
      this._updateGlobalPlayerUI()
    }

    this._setEvents()
  }

  get currentTime () {
    return this.state.currentTime
  }

  set currentTime (currentTime) {
    let state = this.state
    state.currentTime = currentTime

    this.state = state
  }

  get episode () {
    return this.podcast.getEpisodeById(this.state.episodeId)
  }

  set episode (episodeId) {
    let state = this.state
    state.episodeId = episodeId

    this.state = state
    console.log('SET EPISODE PODCAST: ' + this.episode.podcastId)
    this.podcast = this.episode.podcastId

    this._updateGlobalPlayerUI()
  }

  get podcast () {
    return Podcast.get(this.state.podcastId)
  }

  set podcast (podcastId) {
    let state = this.state
    state.podcastId = podcastId

    console.log('SET PODCAST: ' + podcastId)
    this.state = state
  }

  get state () {
    return JSON.parse(
      localStorage.getItem(this.#stateKey)
    )
  }

  set state (obj) {
    console.log('SAVE STATE')
    console.log(obj)
    localStorage.setItem(
      this.#stateKey,
      JSON.stringify({
        currentTime: obj.currentTime,
        episodeId: obj.episodeId,
        podcastId: obj.podcastId
      })
    )

    /*
    if (this.podcast) {
      this.episode.currentTime = this.state.currentTime
    }
    */
  }

  /* Private */
  _updateGlobalPlayerUI () {
    document.getElementById(
      'podcast-display-name'
    ).innerHTML = `
    ${this.episode.title}<br />${this.episode.podcast.title} &ndash; ${this.episode.pubDate}
    `
  }

  _setCurrentTime (e) {
    console.log('SET CURRENT TIME')
    console.log(e.target.currentTime)
    this.currentTime = e.target.currentTime
  }

  _setEvents () {
    this.audioPlayer.removeEventListener('play', this.play)
    this.audioPlayer.removeEventListener('pause', this.pause)

    this.audioPlayer.addEventListener('timeupdate', (e) => {
      this._setCurrentTime(e)
    })
  }
}
