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
    this.pubDate = args.pubDate
    this.title = args.title
    this.playing = false
  }

  get podcast () {
    return Podcast.get(this.podcastId)
  }

  set podcast (podcastId) {
    this.podcastId = podcastId
  }

  // We use the podcast state to track this, but the state was moved to cache.
  get state () {
    return this.podcast.state.episodes[this.id] || {}
  }

  set state (state) {
    let podcastState = this.podcast.state
    podcastState.episodes[this.id] = state

    this.podcast.state = podcastState
    this.react()
  }

  get played () {
    return this.state.played
  }

  set played (played) {
    let currentState = this.state
    currentState.played = played
    this.state = currentState
  }

  get currentTime () {
    return this.state.currentTime
  }

  set currentTime (currentTime) {
    let currentState = this.state

    currentState.currentTime = currentTime
    this.state = currentState
    this.updateTimeElapsed()
  }

  uidClassName () {
    return `ep-${this.id}`
  }

  pubDateDisplay () {
    return new Date(
      Date.parse(this.pubDate)
    ).toLocaleDateString()
  }

  /*
    `json` and `obj` currently aren't being used,
    due to how it's being serialized when storing the episode's
    podcast.

    These will probably be necessary soon, though.
  */
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
      podcast: this.podcast.id,
      pubDate: this.pubDate,
      title: this.title
    }
  }

  update (attrs) {
    let keys = [
      'duration'
    ]

    Object.keys(attrs).map(attr => {
      if (keys.include(attr)) {
        this[attr] = attrs[attr]
      }
    })
  }

  // Slop, but more efficient slop.
  react () {
    // @todo Fix dupe child elements.
    // This creates dupe children. For now, this is faster than the prior
    // redraw methods, so we'll deal with it.
    const epEle = document.getElementById(this.id)
    if (epEle) {
      epEle.innerHTML = this.detailedHTML()

      // Should work out a better resolution between this and `Podcast.refreshView`,
      // but for now it's fine.
      Episode.setEvents(epEle)
    }
  }

  detailedHTML () {
    let iconClass = 'episode-metadata-icon'
    let icons = `<span class="${iconClass} spacer"></span>`

    if (this.isActive()) {
      if (!player.playing) {
        icons = `<span
            class="${iconClass} paused"
          >
            <svg class="bi bi-volume-down-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8.717 3.55A.5.5 0 019 4v8a.5.5 0 01-.812.39L5.825 10.5H3.5A.5.5 0 013 10V6a.5.5 0 01.5-.5h2.325l2.363-1.89a.5.5 0 01.529-.06z" clip-rule="evenodd"/>
            </svg>
          </span>`
      } else {
          icons = `
          <span
            class="${iconClass} playing"
          >
            <svg class="bi bi-volume-up-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.536 14.01A8.473 8.473 0 0014.026 8a8.473 8.473 0 00-2.49-6.01l-.708.707A7.476 7.476 0 0113.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
              <path d="M10.121 12.596A6.48 6.48 0 0012.025 8a6.48 6.48 0 00-1.904-4.596l-.707.707A5.483 5.483 0 0111.025 8a5.483 5.483 0 01-1.61 3.89l.706.706z"/>
              <path d="M8.707 11.182A4.486 4.486 0 0010.025 8a4.486 4.486 0 00-1.318-3.182L8 5.525A3.489 3.489 0 019.025 8 3.49 3.49 0 018 10.475l.707.707z"/>
              <path fill-rule="evenodd" d="M6.717 3.55A.5.5 0 017 4v8a.5.5 0 01-.812.39L3.825 10.5H1.5A.5.5 0 011 10V6a.5.5 0 01.5-.5h2.325l2.363-1.89a.5.5 0 01.529-.06z" clip-rule="evenodd"/>
            </svg>
          </span>`
      }
    }

    let playedBadge = ''
    if (this.played) {
      playedBadge = `
        <span
          class="badge badge badge-light"
        >
          <svg class="bi bi-check" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clip-rule="evenodd"/>
          </svg>
          Played
        </span>`
    }

    return `
      <div
        class="episode ${
          this.isActive() ? 'active' : ''
        } ${this.uidClassName()}"
        id="${this.id}"
        data-episode-id="${this.id}"
        data-podcast-id="${this.podcastId}"
      >
        <div
          class="episode-metadata"
        >
          <div
            class="episode-header"
          >
            <div
              class="episode-header-col"
            >
              <h5
                class="episode-title"
              >
                ${icons} ${this.title}
              </h5>

              <span
                class="duration badge badge-light"
              >
                ${this.durationMin()} Min
              </span>

              ${playedBadge}

              <h6 class="episode-date">
                ${this.pubDateDisplay()}
              </h6>
            </div>
            <div
              class="episode-header-col"
            >
              <div
                class="episode-options"
              >
                <div
                  class="dropdown"
                >
                  <button
                    class="trigger-ep-ctx-menu btn btn-sm btn-settings btn-primary"
                    type="button"
                    data-podcast-id="${this.podcastId}"
                    data-episode-id="${this.id}"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    &#8943;
                  </button>
                </div>
              </diV>
            </div>
          </div>
          <div
            class="episode-supplemental"
          >
            <div
              class="episode-description"
            >
              <p>
                ${this.description}
              </p>
              <div
                class="episode-time-remaining"
              >
                ${this._remainingTimeHTML()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  isActive () {
    return this.id === player.state.episodeId
  }

  updateTimeElapsed () {
    let epEle = document.getElementById(this.id)

    if (epEle) {
      let remainingEle = epEle.querySelector('.episode-time-remaining')

      if (remainingEle) {
        remainingEle.innerHTML = this._remainingTimeHTML()
      }
    }
  }

  minElapsed () {
    if (this.currentTime) {
      return this._timeToMin(this.currentTime)
    } else {
      return ''
    }
  }

  minRemaining () {
    if (this.currentTime) {
      return this.durationMin() - this.minElapsed()
    }
  }

  durationMin () {
    let duration = this.getDuration()
    return this._timeToMin(duration)
  }

  // Handling parsing non-standard duration formats
  getDuration () {
    // @todo if a proper duration isn't given, supply a visibly absurd duration in its place.
    // We do this to prevent the episode from being immediately marked as played.
    let duration = this.duration || '9999999999'
    let durParts = duration.split(':')

    if (durParts.length > 1) {
      durParts = durParts.map(part => Number.parseInt(part))

      // Should programmatically calc seconds by durParts length, but
      // for now, we'll just special-case it.
      // Under an hour
      if (durParts.length == 2) {
        durParts.unshift(0)
      }

      duration = (
        (
          durParts[0] * 3600
        ) + (
          durParts[1] * 60
        ) + durParts[2]
      )
    }

    return duration
  }

  pubDisplayDate () {
    let eles = this.pubDate.split(' ')

    return [ eles[2], (eles[1] + ','), eles[3] ].join(' ')
  }

  _timeToMin (time) {
     return Math.floor(time / 60)
  }

  _remainingTimeHTML () {
    let minElapsed = this.minElapsed()
    let minRemaining = this.minRemaining()
    let maxMin = this.durationMin()

    return this.currentTime ? `
      <progress
        class="episode-time-remaining-progress"
        max="${maxMin}"
        value="${minElapsed}"
      >
        ${minElapsed}
      </progress>

      <span
        class="duration badge badge-light"
      >
        ${minRemaining} min left
      </span>
    ` : ''
  }

  // Episodes
  static setEvents (parentEle) {
    parentEle.querySelectorAll('.mark-episode-played').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          let id = e.currentTarget.dataset.episodeId
          let ep = this.getEpisodeById(id)

          ep.played = true
          ep.refreshDisplay(e)
        }
      )
    })

    parentEle.querySelectorAll('.mark-episode-unplayed').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          let id = e.currentTarget.dataset.episodeId
          let ep = this.getEpisodeById(id)

          ep.played = false
          ep.refreshDisplay(e)
        }
      )
    })

    parentEle.querySelectorAll('.episode-description a').forEach(ele => {
      ele.addEventListener(
        'click',
        (e) => {
          window.api.send(
            'openURL',
            e.currentTarget.getAttribute('href')
          )

          e.preventDefault()
        }
      )
    })

    parentEle.querySelectorAll('.trigger-ep-ctx-menu').forEach(ele => {
      ele.addEventListener('click', (e) => {
        Episode._showEpCtxMenu(e)

        e.preventDefault()
      }, false)
    })

    parentEle.querySelectorAll('.episode').forEach(ele => {
      ele.addEventListener('contextmenu', (e) => {
        Episode._showEpCtxMenu(e)

        e.preventDefault()
      }, false)
    })

    return parentEle
  }

  static _showEpCtxMenu (e) {
    let pid = e.currentTarget.dataset.podcastId
    let eid = e.currentTarget.dataset.episodeId

    let podcast = Podcast.get(pid)
    let ep = podcast.getEpisodeById(eid)

    window.api.send(
      'showEpCtxMenu',
      {
        id: ep.id,
        podcastId: ep.podcastId,
        played: ep.played
      }
    )
  }

}

if (typeof(module) !== 'undefined') {
  module.exports = Episode
}
