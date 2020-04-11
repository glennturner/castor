class Podcast {
  #artwork
  #author
  #description
  #copyright
  #episodesType
  #feed
  #id
  #lastUpdated
  #player
  #pubDate
  #title

  constructor (args) {
    console.log('ITEM: ' + args.identity)
    // Basic info
    // Usually supplied by iTunes.
    this.#id = args.id
    this.#author = args.identity
    this.#artwork = args.artwork
    this.#feed = args.feed
    this.#title = args.title
    this.#player = new Player
    this.episodes = args.episodes || []
  }

  // Update podcast information via feed.
  async _update (forceUpdate = false) {
    // Don't update if already updated.
    if (this.#lastUpdated && !forceUpdate) {
      return
    }

    return await this.getFeed().then((parsed) => {
      this.#title = parsed.title
      this.#author = parsed.author
      this.#description = parsed.description
      this.#copyright = parsed.copyright
      this.#pubDate = parsed.pubDate
      this.#lastUpdated = parsed.lastUpdated || new Date
      this.#artwork = parsed.artwork
      this.#episodesType = parsed.episodesType

      this.episodes = parsed.episodes
    })
  }

  async getFeed () {
    return new Feed(this.#feed).get()
  }

  async playLatest () {
    return await this._update().then(() => {
      let ep = this.episodes[0]
      ep.episodeUrl = 'http://localhost:5000/podcast'

      // Not 100% sure why `Player#togglePlayback` is not working here,
      // so we manually control pausing.
      if ( this.#player.playing && this.#player.episode == ep ) {
        this.#player.pause()
      } else {
        this.#player.episode = ep
        this.#player.play()
      }
    })
  }

  capsule () {
    let showEle = document.createElement('div')
    showEle.className = 'podcast-show'

    showEle.innerHTML = `
      <img
        src="${this.#artwork}"
      />
      <div
        class="title"
      >
        ${this.#title}
      </div>
      <div
        class="author"
      >
        ${this.#author}
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
                src="${this.#artwork}"
                class="artwork"
              />
            </div>
            <div
              class="podcast-show-content"
            >
              <h2>
                ${this.#title}
              </h2>
              <h3>
                ${this.#author}
              </h3>
        ` + eps + `
            </div>
          </div>
        `

        return detailedEle
      })
  }

  /* Private */

  _detailedEp (ep) {
    return `
      <div
        class="episode"
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
}
