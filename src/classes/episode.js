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
  get state () {
    return this.podcast.state.episodes[this.id] || {}
  }

  set state (state) {
    let podcastState = this.podcast.state
    podcastState.episodes[this.id] = state

    this.podcast.state = podcastState
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

  detailedHTML () {
    return `
      <div
        class="episode ${
          this.isActive() ? 'active' : ''
        }"
        id="${this.id}"
        data-episode-id="${this.id}"
      >
        <div
          class="episode-metadata"
        >
          <h4>
            ${this.episodeNum} ${this.title}
          </h4>
          <p>
            ${this.description}
          </p>
        </div>
        <div
          class="episode-options"
        >
          <div
            class="dropdown"
          >
            <button
              class="btn btn-settings btn-secondary"
              type="button"
              id="episodeDropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              &#8943;
            </button>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="episodeDropdownMenuButton">
              <a class="dropdown-item" href="#">Mark as Played</a>
            </div>
          </div>
        </diV>
      </div>
    `
  }

  isActive () {
    console.log('PLAYING? ' + this.playing)
    return this.id === player.state.episodeId
  }
}

