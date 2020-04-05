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
  }

  // Update podcast information via feed.
  async _update () {
    this.getFeed((parsed) => {
      this._title = parsed.title
      this._identity = parsed.title
      this._description = parsed.description
      this._copyright = parsed.copyright
      this._pubDate = parsed.pubDate
      this._lastUpdated = parsed.lastUpdated
      this._artwork = parsed.artwork
      this._episodesType = parsed.episodesType
      this._episodes = []

      this._episodes.map(item => {
        this._episodes.push(
          {
          }
        )
      })
    })
  }

  async getFeed () {
    return fetch(this._feed)
      .then(response => response.text())
      .then((str) => {
        this._parseFeed(
          (new window.DOMParser()).parseFromString(str, "text/xml")
        )
      })
  }

  async playLatest () {
    console.log('PLAY LATEST')
    console.log(this)

    await this._update()
      .then(() => {
      console.log('FEED')
      console.log(this._episodes)
    })
  }

  _parseFeed (xml) {
    console.log('PARSE FEED')

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

    console.log('SHOW ELE')
    console.log(showEle.querySelectorAll('.btn-play'))

    showEle.querySelectorAll('.btn-play')[0].addEventListener(
      'click',
      (e) => {
        this.playLatest()
      }
    )

    return showEle
  }
}
