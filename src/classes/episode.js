class Episode {
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
  }

  get podcast () {
    return Podcast.get(this.podcastId)
  }

  set podcast (podcastId) {
    this.podcastId = podcastId
  }

  // We use the podcast state to track this, but the state was moved to cache.
  get state () {
    return this.podcast.state.episodes[this.id] || {}
  }

  set state (state) {
    let podcastState = this.podcast.state
    podcastState.episodes[this.id] = state

    this.podcast.state = podcastState
  }

  get playing () {
    return this.state.playing
  }

  set playing (playing) {
    let currentState = this.state
    currentState.playing = playing
    this.state = currentState
  }

  get played () {
    return this.state.played
  }

  set played (played) {
    let currentState = this.state
    currentState.played = played
    this.state = currentState
  }

  get currentTime () {
    return this.state.currentTime
  }

  set currentTime (currentTime) {
    let currentState = this.state

    currentState.currentTime = currentTime
    this.state = currentState
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

