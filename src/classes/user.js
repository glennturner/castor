class User {
  #subscribedPodcastKey = 'C-SUB-P'

  constructor () {
    this._renderSubscriberNav()
  }

  get subscribedPodcasts () {
    let podcasts = this.subscribedPodcastIds().map(
      podcast => Podcast.get(podcast)
    // Yeah. Bad DB issue.
    // @todo Fix.
    ).filter(podcast => podcast !== undefined)

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
    console.log('UNSUB ' + podcastId)
    // this.subscribedPodcasts = this.subscribedPodcasts.filter(item => (item.id != podcastId))

    console.log(this.subscribedPodcasts)
    this._renderSubscriberNav()
  }

  subscribedPodcastIds () {
    return JSON.parse(
      localStorage.getItem(this.#subscribedPodcastKey)
    ) || []
  }

  /* Private */

  _renderSubscriberNav () {
    let html = ''
    console.log('RENDER SUB NAV')
    console.log(this.subscribedPodcasts)
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
