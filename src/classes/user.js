class User {
  #subscribedPodcastKey = 'C-SUB-P'
  #refreshMS = 900000

  constructor () {
    this._subscribedItemsEle = document.getElementById('subscribed-items')
    this._renderSubscriberNav()
    this._addEvents()
  }

  get prefs () {
    return JSON.parse(
      localStorage.getItem(Podcast.prefKey)
    ) || {}
  }

  set prefs (prefs) {
    localStorage.setItem(Podcast.prefKey,
      JSON.stringify(prefs)
    )
  }

  get subscribedPodcasts () {
    let podcasts = this.subscribedPodcastIds().map(
      (podcast) => {
        return Podcast.get(podcast)
      }
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

    /* Replace with break event? */
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

  refreshView () {
    return new Promise(resolve => {
      this._renderSubscriberNav()
      resolve()
    })
  }

  refreshSubscriptions () {
    return new Promise(resolve => {
      let i = 0
      let threshold = this.subscribedPodcasts.length

      this.subscribedPodcasts.map((podcast) => {
        podcast.update(true).then(() => {
          i += 1

          if (i === threshold) {
            let prefs = this.prefs
            prefs.lastRefreshedAt = new Date

            this.prefs = prefs
            this.refreshView()
            resolve()
          }
        })
      })
    })
  }

  // This currently only toggles active podcasts.
  // Eventually it should be tweaked to handle other list item changes.
  updateSubscriberNav (opts) {
    let active = this._subscribedItemsEle.querySelector('.list-group-item.active')
    let qs = '.subscribed-podcast-unplayed-count .badge'
    if (active) {
      active.classList.remove('active')
      if (active = active.querySelector(qs)) {
        this._deactivateListItemBadge(active)
      }
    }

    active = this._subscribedItemsEle.querySelector("[data-podcast-id='" + opts.podcastId + "']")

    if (active) {
      active.classList.add('active')
      if (active = active.querySelector(qs)) {
        this._activateListItemBadge(active)
      }
    }
  }

  exportOPML (title = 'podcasts.opml') {
    let subscrXML = ''
    this.subscribedPodcasts.forEach(item => {
      subscrXML += `
        <outline
          text="${item.title}"
          description="${item.description}"
          htmlUrl="${item.link}"
          language="${item.language}"
          title="${item.title}"
          type="rss"
          version="RSS"
          xmlUrl="${item.feed}"
        />
`
    })

    let xml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<opml version="2.0">
  <head>
    <title>${title}</title>
    <dateCreated>${new Date}</dateCreated>
    </head>
  <body>
    ${subscrXML}
  </body>
</opml>`

    return xml
  }

  exportBackup () {
    return JSON.stringify(localStorage)
  }

  /* Static */

  /* Private */

  _activateListItemBadge (ele) {
    ele.classList.remove('badge-primary')
    ele.classList.add('badge-light')
  }

  _deactivateListItemBadge (ele) {
    ele.classList.remove('badge-light')
    ele.classList.add('badge-primary')
  }

  _addEvents () {
    // Set refresh subscription intverval.
    setInterval(() => {
      let e = {
        target: document.querySelector('.refresh-subscribed-podcasts')
      }

      this._invokeRefresh(e)
    }, this.#refreshMS)

    document.querySelector('.refresh-subscribed-podcasts').addEventListener('click', (e) => {
      this._invokeRefresh(e)
    })
  }

  _invokeRefresh (e) {
    e.target.classList.add('rotate')
    this.refreshSubscriptions().then(() => {
      e.target.classList.remove('rotate')
    })
  }

  _renderSubscriberNav () {
    let html = ''

    function sortByUnplayed (a, b) {
      return b.unplayedCount() - a.unplayedCount()
    }

    this.subscribedPodcasts.sort(sortByTitle).map(item => {
      let unplayedBadge = ''
      let unplayedCount = item.unplayedCount()

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
          class="list-group-item list-group-item-action ${active ? 'active' : ''} d-flex justify-content-between align-items-center"
          data-podcast-id="${item.id}"
          title="${item.title}"
        >
          <span
            class="subscribed-podcast-title"
          >
            <img
              src="${item.artwork}"
              class="sm-podcast-img"
            />
            ${item.title}
          </span>
          ${unplayedBadge}
        </a>
      `
    })

    let lastRefreshedAt = this.prefs.lastRefreshedAt
    if (lastRefreshedAt) {
      let refreshedLocal = new Date(lastRefreshedAt).toLocaleString()
      html += `
        <p
          class="last-refreshed-at"
        >
          Last refreshed at<br />
          ${refreshedLocal}
        </p>`
    }

    this._subscribedItemsEle.innerHTML = html
    this._subscribedItemsEle.querySelectorAll('.list-group-item-action').forEach(ele => {
      ele.removeEventListener('click', (e) => {
        Podcast.showDetailedViewById(e.currentTarget.dataset.podcastId)
      })

      ele.addEventListener('click', (e) => {
        Podcast.showDetailedViewById(e.currentTarget.dataset.podcastId)
      })
    })

    this._subscribedItemsEle.querySelectorAll('.list-group-item-action').forEach(ele => {
      ele.addEventListener('contextmenu', (e) => {
        Podcast._showPodcastCtxMenu(e)

        e.preventDefault()
      }, false)
    })
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = User
}
