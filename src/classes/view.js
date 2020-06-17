class View {
  #currentPage = 0
  #debug = false
  #pages = []
  #parent

  static #historyKey = 'C-HIS'

  constructor (parentId, opts={}) {
    this.#parent = document.getElementById(parentId)
  }

  _canGoBack () {
    return this.#pages.length > 1
  }

  back () {
    // Remove current page.
    this.#pages.pop()

    this._doChange(
      // Go to prior.
      this.#pages.pop()
    )
  }

  loading () {
    this.#parent.innerHTML = `
      <div class="main-loader d-flex justify-content-center">
        <div class="spinner-border text-secondary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    `

    const body = document.getElementsByTagName('body')[0]
    body.classList.add('loading')
  }

  loaded () {
    const body = document.getElementsByTagName('body')[0]
    body.classList.remove('loading')
  }

  // `opts` are primarily for history use:
  //   - query: usually a search term
  //   - podcastId
  //   - episodeId
  change (type, html, opts) {
    view.loaded()
    user.updateSubscriberNav(opts)

    this._setHistory(
      {
        episodeId: opts.episodeId,
        podcastId: opts.podcastId,
        query: opts.query,
        type: type
      }
    )

    this.#parent.innerHTML = ''
    this.#parent.appendChild(this._viewNav())
    this.#parent.appendChild(html)

    this._storeHistory()
  }

  // Uses the last stored page.
  resume () {
    let history = this._getHistory()

    if (history && Object.keys(history).length) {
      this._doChange(history)
    }
  }

  /* Static */

  static history () {
    return JSON.parse(
      localStorage.getItem(View.#historyKey) || '{}'
    )
  }

  /* Private */

  _setHistory (opts) {
    // We store page history as JSON, so this kind of comparison is OK.
    if (
      JSON.stringify(opts) !== JSON.stringify(this.#pages[this.#pages.length - 1])
    ) {
      this.#pages.push(opts)
    }
  }

  _viewNav () {
    let nav = document.createElement('nav')
    nav.addClass = 'view-nav'

    if (this._canGoBack()) {
      let back = document.createElement('button')
      back.classList = 'btn btn-sm btn-light'
      back.innerHTML = `
        <svg class="bi bi-chevron-left" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z" clip-rule="evenodd"/>
        </svg>
      `

      back.addEventListener('click', () => { this.back() })
      nav.appendChild(back)
    }

    if (this.#debug) {
      let debug = document.createElement('button')
      debug.innerHTML = 'Debug'
      nav.appendChild(debug)
    }

    return nav
  }

  // See `change` for valid `opts.type` values.
  _doChange(opts) {
    switch (opts.type) {
      case 'searchResults':
        search(opts.query)

        break
      case 'podcast':
        let podcast = Podcast.get(opts.podcastId)

        podcast.detailed().then(ele => {
          view.change('podcast',
            ele,
            {
              podcastId: podcast.id
            }
          )
        })

        break
      default:
        alert(`Invalid view: ${opts.type}`)
    }
  }

  _getHistory () {
    return View.history()
  }

  // We only store the latest page.
  _storeHistory () {
    localStorage.setItem(
      View.#historyKey,
      JSON.stringify(
        this.#pages[this.#pages.length - 1]
      )
    )
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = View
}
