class User {
  #subscribedPodcastKey = 'C-SUB-P'

  constructor () {
    this._renderSubscriberNav()
  }

  get subscribedPodcasts () {
    let podcasts = (
      JSON.parse(
        localStorage.getItem(this.#subscribedPodcastKey)
      ) || []
    ).map(podcast => Podcast.get(podcast))

    console.log('GET SUBED PODCASTS')
    console.log(podcasts)

    return podcasts
  }

  set subscribedPodcasts (ids) {
    localStorage.setItem(
      this.#subscribedPodcastKey,
      JSON.stringify(ids)
    )
  }

  subscribe (podcastId) {
    let subscribed = this.subscribedPodcasts.map(podcast => podcast.id)

    this.subscribedPodcasts = [...new Set(
      subscribed.concat([podcastId])
    )]

    this._renderSubscriberNav()
  }

  unsubscribe (podcastId) {
    console.log('UNSUB')
    console.log(podcastId)
    this.subscribedPodcasts = this.subscribedPodcasts.filter(item => item !== podcastId)

    console.log(this.subscribedPodcasts)
    this._renderSubscriberNav()
  }

  /* Private */

  _renderSubscriberNav () {
    let html = ''
    this.subscribedPodcasts.map(item => {
      html += `
        <div
          class="list-group-item"
        >
          ${item.title}
        </div>
      `
    })

    subscriberNav.innerHTML = html
  }
}
