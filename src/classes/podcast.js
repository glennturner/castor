class Podcast {
  #player
  #cacheKey
  #stateKey

  static prefKey = 'C-PF'

  static #cacheKeyPrefix = 'C-P-'
  static #stateKeyPrefix = 'C-P-S-'
  static #unplayedFilterVal = 'unplayed'

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

  get filterEpisodesBy () {
    return this.prefs.filterEpisodesBy || 'none'
  }

  set filterEpisodesBy (filterBy) {
    this._setPref('filterEpisodesBy', filterBy)
  }

  get prefs () {
    return JSON.parse(
      localStorage.getItem(Podcast.prefKey)
    ) || {}
  }

  set prefs (prefs) {
    localStorage.setItem(Podcast.prefKey,
      JSON.stringify(prefs)
    )
  }

  get lastOpenedAt () {
    this.prefs.lastOpenedAt
  }

  set lastOpenedAt (lastOpenedAt) {
    let state = this.state

    state.lastOpenedAt = lastOpenedAt
    this.state = state
  }

  get state () {
    let state = localStorage.getItem(this.stateKey)

    if (!state) {
      state = this.state = {
        episodes: {}
      }
    } else {
      state = JSON.parse(state)
    }

    return state
  }

  set state (state) {
    localStorage.setItem(
      this.stateKey, JSON.stringify(state)
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

    this.refresh()
  }

  unsubscribe () {
    user.unsubscribe(this.id)

    this.refresh()
  }

  subscribed () {
    return user.subscribedPodcastIds().includes(this.id)
  }

  archive () {
    user.archive(this.id)

    this.refresh()
  }

  unarchive () {
    user.unarchive(this.id)

    this.refresh()
  }

  archived () {
    return true
  }

  unplayedCount () {
    return this.unplayedEpisodes().length
  }

  unplayedEpisodes () {
    return this.episodes.filter(item => !item.played)
  }

  // Eventually we should optimize this to allow for refreshing
  // specific elements, but this is fine for now.
  refresh (e) {
    this._showDetailedView(e)
    user.refresh()
  }

  async getFeed () {
    return new Feed(this.feed).get()
  }

  async playLatest () {
    return await this._update().then(() => {
      this.playEpisode(this.episodes[0])
    })
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
        if (e.currentTarget == e.target) {
          this._showDetailedView(e)
        }
      }
    )

    return showEle
  }

  async detailed () {
    return await this._update()
      .then(() => {
        return this._detailedEpList(
          {
            filterEpisodesBy: this.filterEpisodesBy
          }
        )
      })
  }

  _filterEpList (filterType = undefined) {
    filterType = filterType || this.filterEpisodesBy

    if (this.filterEpisodesBy === Podcast.#unplayedFilterVal) {
      return this.unplayedEpisodes()
    } else {
      return this.episodes
    }
  }

  _detailedEpList (opts = {}) {
    let detailedEle = document.createElement('div')
    detailedEle.className = 'podcast-show-detailed'

    let eps = this._filterEpList().map(ep => {
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
                <a class="dropdown-item refresh-podcast" href="#">Refresh</a>
                <a class="dropdown-item mark-podcast-as-played" href="#">Mark All as Played</a>
                <a class="dropdown-item mark-podcast-as-unplayed" href="#">Mark All as Unplayed</a>
              </div>
            </span>
          </nav>
        </div>
        <div
          class="podcast-show-content"
        >
          <h3>
            ${this.title}
          </h4>
          <h6>
            ${this.author}
          </h6>
          <nav
            class="podcast-episodes-view-by"
          >
            <div
              class="btn-group"
              role="group"
              aria-label="Episode List"
            >
              <button
                type="button"
                class="btn btn-sm btn-${this._unplayedFilter() ? 'primary' : 'light'}"
                data-ep-list-filter="unplayed"
              >
                Unplayed
                <span
                  class="badge badge-secondary"
                >
                  ${this.unplayedCount()}
                </span>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-${!this._unplayedFilter() ? 'primary' : 'light'}"
                data-ep-list-filter="none"
              >
                Feed
              </button>
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

          player.playEpisode(ep)
        }
      )
    })

    detailedEle.querySelectorAll('.mark-episode-played').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          let id = e.currentTarget.dataset.episodeId
          let ep = this.getEpisodeById(id)

          ep.played = true
          this.refresh(e)
        }
      )
    })

    detailedEle.querySelectorAll('.mark-episode-unplayed').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          let id = e.currentTarget.dataset.episodeId
          let ep = this.getEpisodeById(id)

          ep.played = false
          this.refresh(e)
        }
      )
    })

    detailedEle.querySelectorAll('[data-ep-list-filter]').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          this._setPref('filterEpisodesBy', e.target.dataset.epListFilter)
          this.refresh()
        }
      )
    })

    detailedEle.querySelectorAll('.mark-podcast-as-played').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          console.log('MARK PODCAST AS PLAYED')
          this.episodes.map(ep => { ep.played = true })
          this.refresh()
        }
      )
    })

    detailedEle.querySelectorAll('.mark-podcast-as-unplayed').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          console.log('MARK PODCAST AS UNPLAYED')
          this.episodes.map(ep => { ep.played = false })
          this.refresh()
        }
      )
    })

    return detailedEle
  }

  _unplayedFilter () {
    return this.prefs.filterEpisodesBy === Podcast.#unplayedFilterVal
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

  // Move to `Episode`?
  _detailedEp (ep) {
    return ep.detailedHTML()
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

  _setPref (key, val) {
    let prefs = this.prefs

    prefs[key] = val
    this.prefs = prefs
  }

  _shouldUpdate () {
    let now = new Date

    return true
  }

  _showDetailedView (e = undefined) {
    this.detailed()
      .then((ele) => {
        view.change('podcast',
          ele,
          {
            podcastId: this.id
          }
        )

        this.lastOpenedAt = new Date

        if (e) {
          this._scrollToElement(e)
        }
      })
  }

  // When we implement refreshing partials, this should be unnecessary.
  _scrollToElement(e) {
    let qs = e.target.dataset.focusQuery
    let ele = document.querySelector(qs)

    if (ele) {
      ele.scrollIntoView({ block: 'center' })
    }
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
