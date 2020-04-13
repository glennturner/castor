class Itunes {
  constructor() {
    this._baseUrl = 'https://itunes.apple.com'
  }

  async search (query, opts = {}) {
    const entity = 'podcast'
    opts.explicit = opts.explicit === undefined ? true : opts.explicit

    const args = {
      attribute: 'titleTerm',
      entity: entity,
      explicit: opts.explicit,
      limit: 50,
      media: entity,
      term: query
    }

    const qs = Object.entries(args).map((arg) => {
      arg[1] = encodeURIComponent(arg[1])
      return arg.join('=')
    }).join('&')

    const searchUrl = this._baseUrl + '/search?' + qs

    return fetch(searchUrl).then((response) => {
      return response.json()
    })
  }
}
