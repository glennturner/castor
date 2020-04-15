class Subscription {
  #podcastId

  constructor (podcastId) {
    this.#podcastId = podcastId
  }

  get podcast () {
    return Podcast.get(this.#podcastId)
  }

  set podcast (podcast) {
    this.#podcastId = podcast.id
  }
}
