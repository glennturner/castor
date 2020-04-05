class Podcast {
  constructor (args) {
    // Basic info
    // Usually supplied by iTunes.
    this._id = args.id
    this._identity = args.identity
    this._artwork = args.artwork
    this._title = args.title
    this._feed = args.feed
  }

  // Update podcast information via feed.
  async _update () {
    this.getFeed((parsed) => {

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
      console.log(this.episodes)
    })
  }

  _parseFeed (xml) {
    console.log('PARSE FEED')

    let parsed = {
      title: xml.querySelector('channel > title').textContent,
      description: xml.querySelector('channel > description').textContent,
      copyright: xml.querySelector('channel > copyright').textContent,
      pubDate: xml.querySelector('channel > pubDate').textContent,
      lastUpdated: xml.querySelector('channel > lastBuildDate').textContent,
      artwork: xml.querySelector('channel > image > url').textContent,
      episodesType: xml.getElementsByTagName('itunes:type')[0].textContent
    }

    console.log(parsed)
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
