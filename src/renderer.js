user = new User

view = new View('main-view')
view.loading()
view.resume()

player = new Player

let searchEle = document.getElementById('search')

/* Ignore space shortcut in search field. */
searchEle.addEventListener('focus', (e) => {
  window.api.send('disableSpace')
}, true)

searchEle.addEventListener('blur', (e) => {
  window.api.send('enableSpace')
}, true)

searchEle.addEventListener('submit', (e) => {
  let searchTerm = document.getElementById('search-input').value

  search(searchTerm)

  e.preventDefault()
  return false
});

function search (searchTerm) {
  let itunes = new Itunes()

  view.loading()
  itunes.search(searchTerm).then((resp) => {
    let podcasts = resp.results.map((item) => {
      return Podcast.getOrInitialize({
        id: item.collectionId,
        artwork: item.artworkUrl600,
        identity: item.artistName,
        title: item.collectionName,
        feed: item.feedUrl,
        lastUpdated: item.releaseDate
      })
    })

    let results = document.createElement('div')
    let foundPodcasts = searchResults(podcasts)

    let searchHeader = document.createElement('h2')
    searchHeader.innerText = `Showing search results for "${searchTerm}"`
    results.appendChild(searchHeader)
    results.appendChild(foundPodcasts)

    view.change(
      'searchResults',
      results,
      {
        query: searchTerm
      }
    )
  }).catch((err) => {
    console.error(err)
  })
}

function searchResults (podcasts) {
  let list = document.createElement('ul')
  list.classList.add('search-results')

  let results = podcasts.map((podcast) => {
    let listItem = document.createElement('li')

    listItem.className = 'show'
    listItem.appendChild(podcast.capsule())

    list.appendChild(listItem)
  })

  return list
}

// @todo Deprecate for direct podcast-less ep lookup?
function getEpByPodcastAndEpIds (podcastId, epId) {
  let podcast = Podcast.get(podcastId)
  return podcast.getEpisodeById(epId)
}

window.api.receive('exportOPML', (filename) => {
  let user = new User
  let xml = user.exportOPML()

  window.api.send('saveOPML', {
    filename: filename,
    xml: xml
  })
})

window.api.receive('exportBackup', (filename) => {
  let user = new User
  let json = user.exportBackup()

  window.api.send('saveBackup', {
    filename: filename,
    json: json
  })
})

window.api.receive('restoreBackup', json => {
  localStorage.clear()
  Object.keys(json).forEach(key => {
    localStorage.setItem(key, json[key])
  })
  window.location.reload()
})

window.api.receive('subscribeByUrl', (id, url) => {
  let podcast = new Podcast({
    id: id,
    feed: url
  })

  podcast.getFeed().then((resp) => {
    podcast.subscribe()
  }).catch(err => {
    console.log('THROW ERROW')
    console.log(err)
  })
})

window.api.receive('togglePlay', () => {
  player.toggle()
})

window.api.receive('markAsPlayed', (epObj) => {
  let ep = getEpByPodcastAndEpIds(epObj.podcastId, epObj.id)
  ep.played = true
})

window.api.receive('markAsUnplayed', (epObj) => {
  let ep = getEpByPodcastAndEpIds(epObj.podcastId, epObj.id)
  ep.played = false
})
