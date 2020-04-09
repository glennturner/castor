class Podcast {
  constructor (args) {
    console.log('ITEM: ' + args.identity)
    // Basic info
    // Usually supplied by iTunes.
    this._id = args.id
    this._author = args.identity
    this._artwork = args.artwork
    this._title = args.title
    this._feed = args.feed
    this._episodes = args.episodes || []
    this._player = new Player
    this._args = args
  }

  // Update podcast information via feed.
  async _update (forceUpdate = false) {
    // Don't update if already updated.
    if (this._lastUpdated && !forceUpdate) {
      return
    }

    return await this.getFeed().then((parsed) => {
      this._title = parsed.title
      this._author = parsed.author
      this._description = parsed.description
      this._copyright = parsed.copyright
      this._pubDate = parsed.pubDate
      this._lastUpdated = parsed.lastUpdated
      this._artwork = parsed.artwork
      this._episodesType = parsed.episodesType
      this._episodes = parsed.episodes
      this._lastUpdated = new Date
    })
  }

  async getFeed () {
    console.log('GET FEED!')
    return await fetch(this._feed)
      .then(response => response.text())
      .then((str) => {
        return this._parseFeed(
          (new window.DOMParser()).parseFromString(str, "text/xml")
        )
      })
  }

  async playLatest () {
    return await this._update().then(() => {
      let ep = this._episodes[0]
      ep.episodeUrl = 'http://localhost:5000/podcast'

      // Not 100% sure why `Player#togglePlayback` is not working here,
      // so we manually control pausing.
      if ( this._player.playing && this._player.episode == ep ) {
        this._player.pause()
      } else {
        this._player.episode = ep
        this._player.play()
      }
    })
  }

  _parseFeed (xml) {
    let parsed = {
      title: xml.querySelector('channel > title').textContent,
      description: xml.querySelector('channel > description').innerHTML,
      copyright: xml.querySelector('channel > copyright').textContent,
      pubDate: xml.querySelector('channel > pubDate').textContent,
      lastUpdated: xml.querySelector('channel > lastBuildDate').textContent,
      artwork: xml.querySelector('channel > image > url').textContent,
      author: xml.getElementsByTagName('itunes:author')[0].textContent,
      episodesType: xml.getElementsByTagName('itunes:type')[0].textContent,
      episodes: []
    }

    xml.querySelectorAll('channel > item').forEach((item) => {
      let enclosure = item.querySelector('enclosure')

      parsed.episodes.push(
        {
          id: item.querySelector('guid').textContent,
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
          pubDate: item.querySelector('pubDate').textContent,
          author: item.querySelector('author').textContent,
          link: item.querySelector('author').textContent,
          duration: xml.getElementsByTagName('itunes:duration')[0].textContent,
          episodeNum: xml.getElementsByTagName('itunes:episode')[0].textContent,
          episodeUrl: enclosure.getAttribute('url')
        }
      )
    })

    return parsed
  }

  capsule () {
    let showEle = document.createElement('div')
    showEle.className = 'podcast-show'

    showEle.innerHTML = `
      <img
        src="${this._artwork}"
      />
      <div
        class="title"
      >
        ${this._title}
      </div>
      <div
        class="author"
      >
        ${this._author}
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
        console.log('ARGS')
        console.log(this._args)

        detailedEle.innerHTML = `
          <div
            class="podcast-show-details"
          >
            <img
              src="${this._artwork}"
              class="artwork"
            />
            <h2>
              ${this._title}
            </h2>
            <h3>
              ${this._author}
            </h3>

          </div>
        `

        return detailedEle
      })
  }
}
