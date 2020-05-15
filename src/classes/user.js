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

  static reset () {
    // localStorage.clear()
    window.location.reload()
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

  refreshView () {
    this._renderSubscriberNav()
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

  get opml () {
  }

  set opml (xml) {
    return `<?xml version="1.0" encoding="ISO-8859-1"?>
<opml version="2.0">
	<head>
		<title>mySubscriptions.opml</title>
		<dateCreated>Sat, 18 Jun 2005 12:11:52 GMT</dateCreated>
		<dateModified>Tue, 02 Aug 2005 21:42:48 GMT</dateModified>
		<ownerName>Dave Winer</ownerName>
		<ownerEmail>dave@scripting.com</ownerEmail>
		<expansionState></expansionState>
		<vertScrollState>1</vertScrollState>
		<windowTop>61</windowTop>
		<windowLeft>304</windowLeft>
		<windowBottom>562</windowBottom>
		<windowRight>842</windowRight>
		</head>
	<body>`
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

  /* Static */

  static exportOPML () {
    console.log('EXPORT SUBS!')
  }

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
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = User
}
