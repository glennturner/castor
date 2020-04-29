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

  static parsePlaylist (xml) {
    console.log('PARSE PLAYLIST')
  }

  static isPlaylist (xml, mainWindow) {
    console.log('IS PLAYLIST')
    console.log(mainWindow)
    window.receive('parsedXML', (data) => {
      console.log(`Received ${data} from main process`);
    })
    window.send('parseXML', "some data")
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Itunes
}

