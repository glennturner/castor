class User {
  #subscribedPodcastKey = 'C-SUB-P'

  constructor () {
  }

  get subscribedPodcasts () {
    return JSON.parse(
      localStorage.getItem(this.#subscribedPodcastKey)
    ) || []
  }

  set subscribedPodcasts (ids) {
    localStorage.setItem(
      this.#subscribedPodcastKey,
      JSON.stringify(ids)
    )
  }

  subscribe (podcastId) {
    let subscribed = this.subscribedPodcasts

    this.subscribedPodcasts = [...new Set(
      subscribed.concat([podcastId])
    )]
  }

  unsubscribe (podcastId) {
    console.log('UNSUB')
    console.log(podcastId)
    this.subscribedPodcasts = this.subscribedPodcasts.filter(item => item !== podcastId)

    console.log(this.subscribedPodcasts)

  }
}
