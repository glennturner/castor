class Episode {
  constructor (podcastId, args = {}) {
    this.podcastId = podcastId

    this.author = args.author
    this.description = args.description
    this.duration = args.duration
    this.episodeNum = args.episodeNum || ''
    this.episodeUrl = args.episodeUrl
    this.id = args.id
    this.link = args.link
    this.podcast = args.podcast
    this.pubDate = args.pubDate
    this.title = args.title

    this.playing = false
  }

  getPodcast () {
    return Podcast.get(this.podcastId)
  }

  json () {
    return JSON.stringify(this.obj)
  }

  obj () {
    return {
      author: this.author,
      description: this.description,
      duration: this.duration,
      episodeNum: this.episodeNum,
      episodeUrl: this.episodeUrl,
      id: this.id,
      link: this.link,
      podcast: this.podcast.guid,
      pubDate: this.pubDate,
      title: this.title
    }
  }
}

