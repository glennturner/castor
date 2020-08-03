class Feed {
  #path
  #xml

  constructor (path = undefined) {
    this.#path = path
  }

  async get () {
    return await this.getXML().then((str) => {
      this.#xml = (new window.DOMParser()).parseFromString(str, "text/xml")

      return this.parse()
    })
  }

  async getXML () {
    return await fetch(this.#path)
      .then(response => response.text())
      .then((str) => {
        return str
      })
  }

  parse () {
    let xml = this.#xml

    // Optional values.
    let channelLink = xml.querySelector('channel > link')
    let copyright = xml.querySelector('channel > copyright')
    let pubDate = xml.querySelector('channel > pubDate')
    let epType = xml.getElementsByTagName('itunes:type')

    let buildDate = xml.querySelector('channel > lastBuildDate')
    buildDate = buildDate || pubDate || ''

    let parsed = {
      title: xml.querySelector('channel > title').textContent,
      description: xml.querySelector('channel > description').innerHTML,
      copyright: copyright ? copyright.textContent : '',
      link: channelLink ? channelLink.textContent : undefined,
      pubDate: pubDate ? pubDate.textContent : undefined,
      lastUpdated: buildDate ? buildDate.textContent : '',
      artwork: this._getArtworkFromFeed(),
      author: xml.getElementsByTagName('itunes:author')[0].textContent,
      episodesType: epType.length ? epType[0].textContent : undefined,
      episodes: []
    }

    xml.querySelectorAll('channel > item').forEach((item) => {
      let duration = item.getElementsByTagName('itunes:duration')[0]
      let enclosure = item.querySelector('enclosure')
      // Optional values.
      let link = item.querySelector('author')
      let epNum = item.getElementsByTagName('itunes:episode')
      let author = item.querySelector('author')

      // Sigh. Default to iTunes, since something changed with with a bunch of feeds there.
      let itunesDescr = item.getElementsByTagName('description')
      itunesDescr = itunesDescr.length ? itunesDescr : undefined
      let itunesSumm = itunesDescr || item.getElementsByTagName('itunes:summary')
      let descrEle  = itunesSumm.length ? itunesSumm[0] : item.querySelector('description')

      parsed.episodes.push(
        {
          id: item.querySelector('guid').textContent,
          title: item.querySelector('title').textContent,
          description: descrEle ? descrEle.textContent : undefined,
          pubDate: item.querySelector('pubDate').textContent,
          author: author ? author.textContent : undefined,
          link: link ? link.textContent : undefined,
          duration: duration ? duration.textContent : undefined,
          episodeNum: epNum.length ? epNum[0].textContent : '',
          episodeUrl: enclosure ? enclosure.getAttribute('url') : undefined
        }
      )
    })

    return parsed
  }

  /* Static */
  static parseXml (xml) {
    let feed = new Feed

    feed._xml = xml
    return feed.parse()
  }

  /* Private */
  _getArtworkFromFeed () {
    let channelUrl = this.#xml.querySelector('channel > image > url')
    let itunesImageUrl = this.#xml.getElementsByTagName('itunes:image')

    if (itunesImageUrl) {
      return itunesImageUrl[0].getAttribute('href')
    } else if (channelUrl) {
      return channelUrl.textContent
    }
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Feed
}
