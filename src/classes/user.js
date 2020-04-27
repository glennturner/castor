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
    this.subscribedPodcasts = this.subscribedPodcasts.filter(
      item => item.id !== podcastId
    ).map(item => item.id)

    this._renderSubscriberNav()
  }

  subscribedPodcastIds () {
    return JSON.parse(
      localStorage.getItem(this.#subscribedPodcastKey)
    ) || []
  }

  refresh () {
    this._renderSubscriberNav()
  }

  /* Private */

  _renderSubscriberNav () {
    let html = ''
    this.subscribedPodcasts.sort(sortByTitle).map(item => {
      html += `
        <a
          href="#"
          class="list-group-item list-group-item-action"
          data-podcast-id="${item.id}"
        >
          ${item.title}

          <span
            class="badge badge-primary"
          >
            ${item.unplayedCount()}
          </span>
        </a>
      `
    })

    subscriberNav.innerHTML = html
    subscriberNav.querySelectorAll('.list-group-item-action').forEach(ele => {
      ele.addEventListener('click', (e) => {
        Podcast.showDetailedViewById(e.currentTarget.dataset.podcastId)
      })
    })
  }
}
