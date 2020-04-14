class View {
  #currentPage = 0
  #debug = false
  #pages = []
  #parent

  constructor (parentId, opts={}) {
    this.#parent = document.getElementById(parentId)
  }

  _canGoBack () {
    return this.#pages.length > 1
  }

  back () {
    console.log('BACK! ' + this.#pages.length)
    // Remove current page.
    this.#pages.pop()

    this._doChange(
      // Go to prior.
      this.#pages.pop()
    )
  }

  // `opts` are primarily for history use:
  //   - query: usually a search term
  //   - podcastId
  //   - episodeId
  change (type, html, opts) {
    this.#pages.push(
      {
        episodeId: opts.episodeId,
        podcastId: opts.podcastId,
        query: opts.query,
        type: type
      }
    )

    this.#parent.innerHTML = ''
    this.#parent.appendChild(
      this._viewNav()
    )
    this.#parent.appendChild(html)
  }

  _viewNav () {
    let nav = document.createElement('nav')
    nav.addClass = 'view-nav'

    if (this._canGoBack()) {
      let back = document.createElement('button')
      back.classList = 'btn btn-primary'
      back.innerHTML = '<'
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
        let podcast = Podcast.getById(opts.podcastId)

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
}
