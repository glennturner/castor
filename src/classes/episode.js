class Episode {
  #episodeKeyPrefix = 'C-P-'
  #stateKey
  #state = {}

  constructor (podcastId, args = {}) {
    this.podcastId = podcastId

    this.author = args.author
    this.description = args.description
    this.duration = args.duration
    this.episodeNum = args.episodeNum || ''
    this.episodeUrl = args.episodeUrl
    this.id = args.id
    this.link = args.link
    this.pubDate = args.pubDate
    this.title = args.title

    this.#stateKey = this.#episodeKeyPrefix + this.id

    this.playing = false
  }

  get podcast () {
    return Podcast.get(this.podcastId)
  }

  set podcast (podcastId) {
    this.podcastId = podcastId
  }

  get stateKey () {
    return this.#episodeKeyPrefix + this.podcastId
  }

  set stateKey (key) {
    return this.#episodeKeyPrefix + key
  }

  // We use the podcast state to track this, but the state was moved to cache.
  // Re-enable podcast state handling.
  get state () {
    this.podcast.state().episodes[this.#stateKey] || {}
  }

  set state (state) {
    let podcastState = this.podcast.state()
    podcastState.episodes[this.#stateKey] = state
    this.podcast.setState(podcastState)
  }

  get currentTime () {
    return this.state.currentTime
  }

  set currentTime (currentTime) {
    console.log('SET CURRENT TIME! ' + currentTime)
    // this.state.currentTime = currentTime
  }

  get played () {
    return this.state.played
  }

  set played (played) {
    let state = this.state
    state.played = played
    this.state = state
  }

  get saved () {
    return this.state.saved
  }

  set saved (saved) {
    let state = this.state
    state.saved = saved
    this.state = state
  }

  /*
    `json` and `obj` currently aren't being used,
    due to how it's being serialized when storing the episode's
    podcast.

    These will probably be necessary soon, though.
  */
  json () {
    return JSON.stringify(this.obj)
  }

  obj () {
    return {
      author: this.author,
      description: this.description,
      duration: this.duration,
      episodeNum: this.episodeNum,
      episodeUrl: this.episodeUrl,
      id: this.id,
      link: this.link,
      podcast: this.podcast.id,
      pubDate: this.pubDate,
      title: this.title
    }
  }
}

