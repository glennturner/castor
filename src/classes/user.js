class User {
  #subscribedPodcastKey = 'C-SUB-P'

  constructor () {
    this._subscribedItemsEle = document.getElementById('subscribed-items')
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
      let unplayedBadge = ''
      let unplayedCount = item.unplayedCount()

      console.log('VIEW HISTORY')
      console.log(View.history())
      let active = View.history().podcastId === item.id

      if (unplayedCount) {
        unplayedBadge = `
          <span
            class="subscribed-podcast-unplayed-count"
          >
            <span
              class="badge badge-${active ? 'light' : 'primary'}"
            >
              ${unplayedCount}
            </span>
          </span>`
      }

      html += `
        <a
          href="#"
          class="list-group-item list-group-item-action ${active ? 'active' : ''}"
          data-podcast-id="${item.id}"
          title="${item.title}"
        >
          <span
            class="subscribed-podcast-title"
          >
            ${item.title}
          </span>
          ${unplayedBadge}
        </a>
      `
    })

    this._subscribedItemsEle.innerHTML = html
    this._subscribedItemsEle.querySelectorAll('.list-group-item-action').forEach(ele => {
      ele.addEventListener('click', (e) => {
        Podcast.showDetailedViewById(e.currentTarget.dataset.podcastId)
      })
    })
  }
}
