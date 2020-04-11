class Episode {
  constructor (podcast, args = {}) {
    this.podcast = podcast

    this.author = args.author
    this.description = args.description
    this.duration = args.duration
    this.episodeNum = args.episodeNum
    this.episodeUrl = args.episodeUrl
    this.id = args.id
    this.link = args.link
    this.podcast = args.podcast
    this.pubDate = args.pubDate
    this.title = args.title
  }
}

