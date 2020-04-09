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
    this.episodes = args.episodes || []
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
      this.episodes = parsed.episodes
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
      let ep = this.episodes[0]
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
    // Optional values.
    let copyright = xml.querySelector('channel > copyright')
    let pubDate = xml.querySelector('channel > pubDate')
    let epType = xml.getElementsByTagName('itunes:type')

    let parsed = {
      title: xml.querySelector('channel > title').textContent,
      description: xml.querySelector('channel > description').innerHTML,
      copyright: copyright ? copyright.textContent : '',
      pubDate: pubDate ? pubDate.textContent : undefined,
      lastUpdated: xml.querySelector('channel > lastBuildDate').textContent,
      artwork: this._getArtworkFromFeed(xml),
      author: xml.getElementsByTagName('itunes:author')[0].textContent,
      episodesType: epType.length ? epType[0].textContent : undefined,
      episodes: []
    }

    xml.querySelectorAll('channel > item').forEach((item) => {
      let enclosure = item.querySelector('enclosure')
      // Optional values.
      let link = item.querySelector('author')
      let epNum = item.getElementsByTagName('itunes:episode')
      let author = item.querySelector('author')

      parsed.episodes.push(
        {
          id: item.querySelector('guid').textContent,
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
          pubDate: item.querySelector('pubDate').textContent,
          author: author ? author.textContent : undefined,
          link: link ? link.textContent : undefined,
          duration: item.getElementsByTagName('itunes:duration')[0].textContent,
          episodeNum: epNum.length ? epNum[0].textContent : undefined,
          episodeUrl: enclosure.getAttribute('url')
        }
      )
    })

    return parsed
  }

  _getArtworkFromFeed (xml) {
    let channelUrl = xml.querySelector('channel > image > url')
    let itunesImageUrl = xml.getElementsByTagName('itunes:image')

    if (itunesImageUrl) {
      return itunesImageUrl[0].getAttribute('href')
    } else if (channelUrl) {
      return channelUrl.textContent
    }
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
                src="${this._artwork}"
                class="artwork"
              />
            </div>
            <div
              class="podcast-show-content"
            >
              <h2>
                ${this._title}
              </h2>
              <h3>
                ${this._author}
              </h3>
        ` + eps + `
            </div>
          </div>
        `

        return detailedEle
      })
  }

  _detailedEp (ep) {
    return `
      <div
        class="episode"
      >
        ${ep.title}
      </div>
    `
  }
}
