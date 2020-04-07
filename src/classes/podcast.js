class Podcast {
  constructor (args) {
    // Basic info
    // Usually supplied by iTunes.
    this._id = args.id
    this._identity = args.identity
    this._artwork = args.artwork
    this._title = args.title
    this._feed = args.feed
    this._episodes = args.episodes || []
    this._player = new Player;
  }

  // Update podcast information via feed.
  async _update (forceUpdate = false) {
    // Don't update if already updated.
    if (this._lastUpdated && !forceUpdate) {
      return
    }

    return await this.getFeed().then((parsed) => {
      this._title = parsed.title
      this._identity = parsed.title
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
      identity: xml.getElementsByTagName('itunes:author')[0].textContent,
      episodesType: xml.getElementsByTagName('itunes:type')[0].textContent,
      episodes: []
    }

    xml.querySelectorAll('channel > item').forEach((item) => {
      let enclosure = item.querySelector('enclosure')

      parsed.episodes.push(
        {
          id: item.querySelector('guid').textContent,
          titile: item.querySelector('title').textContent,
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
        class="identity"
      >
        ${this._identity}
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
        changeMainView('podcast', this.detailed())
      }
    )

    return showEle
  }

  detailed () {
    let detailedEle = document.createElement('div')
    detailedEle.className = 'podcast-show-detailed'

    return detailedEle
  }
}
