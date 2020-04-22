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

    this.playing = false
  }

  get podcast () {
    return Podcast.get(this.podcastId)
  }

  set podcast (podcastId) {
    this.podcastId = podcastId
  }

  // We use the podcast state to track this, but the state was moved to cache.
  // Re-enable podcast state handling.
  get state () {
    this.podcast.state.episodes[this.id] || {}
  }

  set state (state) {
    console.log('SET EP STATE')
    console.log(state)

    console.log('PODCAST STATE')
    console.log(this.podcast.state.episodes)
    let podcastState = this.podcast.state
    podcastState.episodes[this.id] = {
      [this.id]: state
    }

    this.podcast.state = podcastState

    console.log('PODCAST STATE 2')
    console.log(this.podcast.state.episodes)
    return this.podcast.state.episodes[this.id]
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
    this.state.played = played
  }

  get saved () {
    return this.state.saved
  }

  set saved (saved) {
    this.state.saved = saved
  }

  get currentTime () {
    return this.state.currentTime
  }

  set currentTime (currentTime) {
    this.state.currentTime = currentTime
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

