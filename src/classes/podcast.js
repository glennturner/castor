class Podcast {
  #feed
  #player

  constructor (args) {
    // Basic info
    // Usually supplied by iTunes.

    // This is usually the iTMS podcast collectionId.
    this.id = args.id

    /*
      Pre-populate?
    */

    this.author = args.identity
    this.artwork = args.artwork
    this.copyright = args.copyright
    this.#feed = args.feed
    this.link = args.link
    this.title = args.title
    this.pubDate = args.pubDate
    this.episodesType = args.episodesType
    this.episodes = args.episodes || []

    this.#player = new Player
  }

  async getFeed () {
    return new Feed(this.#feed).get()
  }

  async playLatest () {
    return await this._update().then(() => {
      this.playEpisode(this.episodes[0])
    })
  }

  async playEpisode (ep) {
    // ep.episodeUrl = 'http://localhost:5000/podcast'

    // Not 100% sure why `Player#togglePlayback` is not working here,
    // so we manually control pausing.
    if ( this.#player.playing && this.#player.episode.episodeUrl == ep.episodeUrl ) {
      this.#player.pause()
    } else {
      this.#player.episode = ep
      this.#player.play()
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
        <span
          class="btn btn-secondary btn-settings"
        >
          &#8943;
      </div>
    `

    showEle.querySelectorAll('.btn-play')[0].addEventListener(
      'click',
      (e) => {
        this.playLatest()
        e.stopPropagation()
      }
    )

    showEle.querySelectorAll('.btn-settings')[0].addEventListener(
      'click',
      (e) => {
        // this.showCapsuleSettings()
        e.stopPropagation()
      }
    )

    showEle.addEventListener(
      'click',
      (e) => {
        this.detailed()
          .then((ele) => {
            changeMainView('podcast', ele)
          })
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
        ` + eps + `
            </div>
          </div>
        `

        detailedEle.querySelectorAll('.episode').forEach(ele => {
          ele.addEventListener(
            'click',
            (e) => {
              let id = e.currentTarget.dataset.episodeId
              console.log('ELE: ' + id)
              console.log(e.currentTarget)
              let ep = this._getEpisodeById(id)
              console.log(ep)
              this.playEpisode(ep)
            }
          )
        })

        return detailedEle
      })
  }

  /* Private */

  _detailedEp (ep) {
    return `
      <div
        class="episode"
        data-episode-id="${ep.id}"
      >
        <h4>
          ${ep.episodeNum} ${ep.title}
        </h4>
        <p>
          ${ep.description}
        </p>
      </div>
    `
  }

  _getEpisodeById (id) {
    return this.episodes.filter(ep => ep.id === id)[0]
  }

  _json () {
    return JSON.stringify(
      {
        title: this.title,
        author: this.author,
        description: this.description,
        copyright: this.copyright,
        pubDate: this.pubDate,
        lastUpdated: this.lastUpdated,
        link: this.link,
        artwork: this.artwork,
        episodesType: this.episodesType,
        lastRetrieved: this.lastRetrieved,
        episodes: this.episodes//.map(ep => ep.obj)
      }
    )
  }

  _shouldUpdate () {
    let now = new Date

    return true
  }

  _storeFeed () {
    localStorage.setItem(
      this.id, this._json()
    )
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

      this._storeFeed()
    })
  }
}
