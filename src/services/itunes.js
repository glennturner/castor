class Itunes {
  constructor() {
    this._baseUrl = 'https://itunes.apple.com'
  }

  async search (query, opts = {}) {
    const entity = 'podcast'
    opts.explicit = opts.explicit === undefined ? true : opts.explicit

    // @see https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/
    const args = {
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

  // Should use IPC to handling parsing via `xmldom`
  // but, for now, we're passing in the parser.
  static parsePlaylist (str, parser) {
    let xml = parser.parseFromString(str)
    let eps = xml.getElementsByTagName('plist')[0].firstChild.nextSibling.childNodes//.filter(item => item.nodeName === 'dict')
    for (let i in eps) {
      let key = eps[i].textContent
      console.log(key)
    }
  }

  // Should use IPC to handling parsing via `xmldom`
  // but, for now, we're passing in the parser.
  static isPlaylist (str, parser) {
    let xml = parser.parseFromString(str)

    return xml.getElementsByTagName('plist').length > 0
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Itunes
}

