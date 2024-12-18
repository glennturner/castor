class Podcast {
  #player
  #cacheKey
  #stateKey

  // In seconds.
  static #updateFrequency = 1800

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
    this.description = args.description
    this.feed = args.feed
    this.language = args.language || 'en'
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
    return JSON.parse(
      localStorage.getItem(this.cacheKey)
    ) || {
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

  async getFeedXML () {
    return new Promise(resolve => {
      const feed = new Feed(this.feed)

      return feed.getXML().then((respXML) => {
        return resolve(respXML)
      })
    })
  }

  subscribe () {
    user.subscribe(this.id)

    this.refreshView()
  }

  unsubscribe () {
    user.unsubscribe(this.id)

    this.refreshView()
  }

  subscribed () {
    return user.subscribedPodcastIds().includes(this.id)
  }

  // PLACEHOLDER
  archive () {
    // NOT IMPLEMENTED
    user.archive(this.id)

    this.refreshView()
  }

  // PLACEHOLDER
  unarchive () {
    // NOT IMPLEMENTED
    user.unarchive(this.id)

    this.refreshView()
  }

  // PLACEHOLDER
  archived () {
    return true
  }

  markAllAsPlayed () {
    this.episodes.filter(item => !item.played).map(item => {
      item.played = true
    })

    this.refreshView()
  }

  markAllAsUnplayed () {
    this.episodes.filter(item => item.played).map(item => {
      item.played = false
    })

    this.refreshView()
  }

  unplayedCount () {
    return this.unplayedEpisodes().length
  }

  unplayedEpisodes () {
    return this.episodes.filter(item => !item.played)
  }

  refresh (e) {
    this.update(true)
    this.refreshView(e)
  }

  // Eventually we should optimize this to allow for refreshing
  // specific elements, but this is fine for now.
  refreshView (e) {
    this._showDetailedView(e)
    user.refreshView()
  }

  // @optimize
  // Instead of re-rendering the entire view, we just update the ep.
  refreshEpView (e, epId) {
    let ep = this.getEpisodeById(epId)
    document.getElementById(epId).innerHTML = ep.detailedHTML()

    //user.refreshSubscriptionEp(epId)
  }

  async getFeed () {
    return new Feed(this.feed).get()
  }

  async playLatest () {
    return await this.update().then(() => {
      player.playEpisode(this.episodes[0])
    })
  }

  isSubscribed () {
    let isSubscribed = user.subscribedPodcasts.filter(podcast => podcast.id === this.id)
    return isSubscribed[0]
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
          class="dropdown"
        >
          <button
            class="trigger-podcast-ctx-menu btn btn-settings btn-secondary"
            type="button"
            data-podcast-id="${this.id}"
            data-podcast-feed="${this.feed}"
            aria-haspopup="true"
            aria-expanded="false"
          >
            &#8943;
          </button>
          <!--
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a
              class="dropdown-item podcast-subscribe-toggle"
              data-podcast-id="${this.id}"
              data-podcast-feed-url="${this.feed}"
              href="#"
            >` + (
              this.isSubscribed() ? 'Unsubscribe' : 'Subscribe'
            ) + `</a>
          </div>
          -->
        </div>
      </div>
    `

    showEle.querySelectorAll('.trigger-podcast-ctx-menu').forEach(ele => {
      ele.addEventListener('click', (e) => {
        Podcast._showPodcastCtxMenu(e)

        e.preventDefault()
      }, false)
    })

    showEle.querySelector('.btn-play').addEventListener(
      'click',
      (e) => {
        this.playLatest()
        e.stopPropagation()
      }
    )

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

  show (e = null) {
    this.refreshView(e)
  }

  async detailed () {
    return await this.update()
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
        return `
          <div
            class="episode-cont"
          >
            ${this._detailedEp(ep)}
          </div>
        `
      }).join('')

    if (!eps) {
      eps = `
        <p
          class="alert alert-success text-center">
          All ${this.title} episodes have been played!
        </p>`
    }

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
                class="trigger-podcast-ctx-menu btn btn-settings btn-sm btn-primary"
                type="button"
                data-podcast-id="${this.id}"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Options
              </button>
              <!--
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="podcastDropdownMenuButton">
                <a class="dropdown-item refresh-podcast" href="#">Refresh</a>
                <a class="dropdown-item mark-podcast-as-played" href="#">Mark All as Played</a>
                <a class="dropdown-item mark-podcast-as-unplayed" href="#">Mark All as Unplayed</a>
              </div>
              -->
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
                  class="badge badge-${this._unplayedFilter() ? 'light' : 'secondary'}"
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

    detailedEle.querySelectorAll('.trigger-podcast-ctx-menu').forEach(ele => {
      ele.addEventListener('click', (e) => {
        Podcast._showPodcastCtxMenu(e)

        e.preventDefault()
      }, false)
    })

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
          e.stopPropagation()
          e.preventDefault()
        },
        false
      )
    })

    detailedEle.querySelectorAll('.refresh-podcast').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          this.refresh(e)
        }
      )
    })

    detailedEle.querySelectorAll('[data-ep-list-filter]').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          this._setPref('filterEpisodesBy', e.target.dataset.epListFilter)
          this.refreshView()
        }
      )
    })

    detailedEle.querySelectorAll('.mark-podcast-as-played').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          this.episodes.map(ep => { ep.played = true })
          this.refreshView()
        }
      )
    })

    detailedEle.querySelectorAll('.mark-podcast-as-unplayed').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          this.episodes.map(ep => { ep.played = false })
          this.refreshView()
        }
      )
    })

    detailedEle = Episode.setEvents(detailedEle)
    return detailedEle
  }

  _unplayedFilter () {
    return this.prefs.filterEpisodesBy === Podcast.#unplayedFilterVal
  }

  getEpisodeById (id) {
    return this.episodes.filter(ep => ep.id === id)[0]
  }

  // Update podcast information via feed.
  async update (forceUpdate = false) {
    // Don't update if already updated.
    if (!this._shouldUpdate() && !forceUpdate) {
      return await this._populate(this.cache)
    } else {
      return await this.getFeed().then((parsed) => {
        this.lastUpdated = new Date
        this.lastRetrieved = new Date
        this._populate(parsed)

        this._cacheFeed()
      }).catch(err => {
        console.error('An error occurred updating this podcast:')
        console.error(err)
      })
    }
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

  static _showPodcastCtxMenu (e) {
    let pid = e.currentTarget.dataset.podcastId
    let feedUrl = e.currentTarget.dataset.podcastFeed

    let subscribed = false
    let podcast = Podcast.get(pid)

    if (podcast) {
      subscribed = podcast.isSubscribed()
    }

    window.api.send(
      'showPodcastCtxMenu',
      {
        id: pid,
        feed: feedUrl,
        subscribed: subscribed
      }
    )
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
        language: this.language,
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
    if (!this.cache.lastUpdated) {
      return true
    }

    let intv = new Date - (Podcast.#updateFrequency * 1000)

    return intv > Date.parse(this.cache.lastUpdated)
  }

  _showDetailedView (e = undefined) {
    view.loading()

    return this.detailed()
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
        view.loaded()
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

  _populate (parsed) {
    this.title = parsed.title
    this.author = parsed.author
    this.description = parsed.description
    this.copyright = parsed.copyright
    this.pubDate = parsed.pubDate
    this.language = parsed.language,
    this.link = parsed.link
    this.artwork = parsed.artwork
    this.episodesType = parsed.episodesType

    this.episodes = parsed.episodes.map((ep) => {
      return new Episode(this.id, ep)
    })
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Podcast
}
