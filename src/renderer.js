user = new User

view = new View('main-view')
view.resume()

player = new Player

document.getElementById('search').addEventListener('submit', (e) => {
  let searchTerm = document.getElementById('search-input').value

  search(searchTerm)

  e.preventDefault()
  return false
});

function search (searchTerm) {
  let itunes = new Itunes()

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
