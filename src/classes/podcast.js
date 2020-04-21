class Podcast {
  #player
  #cacheKey
  #stateKey

  static #cacheKeyPrefix = 'C-P-'
  static #stateKeyPrefix = 'C-P-S-'

  constructor (args) {
    // This is usually the iTMS podcast collectionId.
    this.id = args.id
    this.cacheKey = this.id
    this.stateKey = this.id

    // Basic info, usually supplied by iTunes.
    this.author = args.identity
    this.artwork = args.artwork
    this.copyright = args.copyright
    this.feed = args.feed
    this.link = args.link
    this.title = args.title
    this.pubDate = args.pubDate
    this.episodesType = args.episodesType
    this.episodes = args.episodes ? args.episodes.map(ep => new Episode(this.id, ep)) : []
  }

  get state () {
    return localStorage.getItem(this.stateKey) || {
      episodes: {}
    }
  }

  set state (state) {
    localStorage.setItem(
      this.stateKey, state
    )
  }

  get cache () {
    return localStorage.getItem(this.cacheKey) || {
      episodes: {}
    }
  }

  set cache (cache) {
    localStorage.setItem(
      this.cacheKey, cache
    )
  }

  get cacheKey () {
    return this.#cacheKey
  }

  set cacheKey (key) {
    this.#cacheKey = Podcast.podcastCacheKey(key)
  }

  get stateKey () {
    return this.#stateKey
  }

  set stateKey (key) {
    this.#stateKey = Podcast.podcastStateKey(key)
  }

  subscribe () {
    user.subscribe(this.id)

    this._showDetailedView()
  }

  unsubscribe () {
    user.unsubscribe(this.id)

    this._showDetailedView()
  }

  subscribed () {
    return user.subscribedPodcastIds().includes(this.id)
  }

  archive () {
    user.archive(this.id)

    this._showDetailedView()
  }

  unarchive () {
    user.unarchive(this.id)

    this._showDetailedView()
  }

  archived () {
    return true
  }

  async getFeed () {
    return new Feed(this.feed).get()
  }

  async playLatest () {
    return await this._update().then(() => {
      this.playEpisode(this.episodes[0])
    })
  }

  /* Move to `Episode`? */
  async playEpisode (ep) {
    // ep.episodeUrl = 'http://localhost:5000/podcast'

    // Not 100% sure why `Player#togglePlayback` is not working here,
    // so we manually control pausing.
    if (player.playing && player.episode.episodeUrl == ep.episodeUrl) {
      player.pause()
    } else {
      player.episode = ep
      player.play()
    }
  }

  capsule () {
    let showEle = document.createElement('div')
    showEle.className = 'podcast-show'

    showEle.innerHTML = `
      <img
        src="${this.artwork}"
      />
      <div
        class="title"
      >
        ${this.title}
      </div>
      <div
        class="author"
      >
        ${this.author}
      </div>

      <div
        class="capsule-player"
      >
        <span
          class="btn btn-primary btn-play"
        >
          &#9657;
        </span>
        <div
          class="dropdown">
        >
          <button
            class="btn btn-settings btn-secondary"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            &#8943;
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="#">Action</a>
            <a class="dropdown-item" href="#">Another action</a>
            <a class="dropdown-item" href="#">Something else here</a>
          </div>
        </div>
      </div>
    `

    showEle.querySelectorAll('.btn-play')[0].addEventListener(
      'click',
      (e) => {
        this.playLatest()
        e.stopPropagation()
      }
    )

    /*
    showEle.querySelector('.btn-settings').addEventListener(
      'click',
      (e) => {
        // this.showCapsuleSettings()
        //e.stopPropagation()
      }
    )
    */

    showEle.querySelector('img').addEventListener(
      'click',
      (e) => {
        console.log('CURRENT TARGET')
        console.log(e.target.classList)

        if (e.currentTarget == e.target) {
          this._showDetailedView()
        }
      }
    )

    return showEle
  }

  async detailed () {
    return await this._update()
      .then(() => {
        let detailedEle = document.createElement('div')
        detailedEle.className = 'podcast-show-detailed'

        let eps = this.episodes.map(ep => {
            return this._detailedEp(ep)
          }).join('')

        detailedEle.innerHTML = `
          <div
            class="podcast-show-details"
          >
            <div
              class="podcast-show-artwork"
            >
              <img
                src="${this.artwork}"
                class="artwork"
              />
              <nav
                class="podcast-options"
              >
                <button
                  id="podcast-subscribe-toggle"
                  type="button"
                  class="btn btn-sm btn-primary"
                  data-toggle="modal"
                  data-target="#podcast-options"
                >
                  ${this.subscribed() ? 'Unsubscribe' : 'Subscribe'}
                </button>

                <span
                  class="dropdown"
                >
                  <button
                    class="btn btn-settings btn-sm btn-primary"
                    type="button"
                    id="podcastDropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Options
                  </button>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="podcastDropdownMenuButton">
                    <a class="dropdown-item" href="#">Refresh</a>
                    <a class="dropdown-item" href="#">Mark All as Played</a>
                  </div>
                </span>
              </nav>
            </div>
            <div
              class="podcast-show-content"
            >
              <h2>
                ${this.title}
              </h2>
              <h3>
                ${this.author}
              </h3>
              <nav
                class="podcast-episodes-view-by"
              >
                <div
                  class="btn-group"
                  role="group"
                  aria-label="Episode List"
                >
                  <button type="button" class="btn btn-sm btn-primary">Unplayed</button>
                  <button type="button" class="btn btn-sm btn-light">Feed</button>
                </div>
              </nav>
              <div
                class="episodes"
              >
        ` + eps + `
              </div>
            </div>
          </div>
        `

        detailedEle.querySelector('#podcast-subscribe-toggle').addEventListener('click', () => {
          this.subscribed() ? this.unsubscribe() : this.subscribe()
        })

        detailedEle.querySelectorAll('.episode').forEach(ele => {
          ele.addEventListener(
            'dblclick',
            (e) => {
              let id = e.currentTarget.dataset.episodeId
              let ep = this.getEpisodeById(id)

              this.playEpisode(ep)
            }
          )
        })

        return detailedEle
      })
  }

  getEpisodeById (id) {
    return this.episodes.filter(ep => ep.id === id)[0]
  }

  /* Static */

  static podcastCacheKey (id) {
    return Podcast.#cacheKeyPrefix + id
  }

  static podcastStateKey (id) {
    return Podcast.#stateKeyPrefix + id
  }

  static get (id) {
    let json = JSON.parse(
      localStorage.getItem(
        Podcast.podcastCacheKey(id)
      )
    )

    if (json) {
      return new Podcast(json)
    }
  }

  static getOrInitialize (args) {
    let podcast = Podcast.get(args.id)

    return podcast || new Podcast(args)
  }

  static showDetailedViewById (id) {
    Podcast.get(id)._showDetailedView()
  }

  /* Private */

  _detailedEp (ep) {
    console.log('GET EP STATE')
    console.log(ep.state)
    return `
      <div
        class="episode"
        data-episode-id="${ep.id}"
      >
        <div
          class="episode-metadata"
        >
          <h4>
            ${ep.episodeNum} ${ep.title}
          </h4>
          <p>
            ${ep.description}
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

  _json () {
    return JSON.stringify(
      {
        id: this.id,
        title: this.title,
        feed: this.feed,
        author: this.author,
        description: this.description,
        copyright: this.copyright,
        pubDate: this.pubDate,
        lastUpdated: this.lastUpdated,
        link: this.link,
        artwork: this.artwork,
        episodesType: this.episodesType,
        lastRetrieved: this.lastRetrieved,
        episodes: this.episodes
      }
    )
  }

  _shouldUpdate () {
    let now = new Date

    return true
  }

  _showDetailedView () {
    this.detailed()
      .then((ele) => {
        view.change('podcast',
          ele,
          {
            podcastId: this.id
          }
        )
      })
  }

  _cacheFeed () {
    this.cache = this._json()
  }

  // Update podcast information via feed.
  async _update (forceUpdate = false) {
    // Don't update if already updated.
    if (this._shouldUpdate() && forceUpdate) {
      return
    }

    return await this.getFeed().then((parsed) => {
      this.title = parsed.title
      this.author = parsed.author
      this.description = parsed.description
      this.copyright = parsed.copyright
      this.pubDate = parsed.pubDate
      this.lastUpdated = parsed.lastUpdated || new Date
      this.link = parsed.link
      this.artwork = parsed.artwork
      this.episodesType = parsed.episodesType
      this.lastRetrieved = new Date

      this.episodes = parsed.episodes.map((ep) => {
        return new Episode(this.id, ep)
      })

      this._cacheFeed()
    })
  }
}
