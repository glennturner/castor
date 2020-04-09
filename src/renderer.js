document.getElementById('search').addEventListener('submit', (e) => {
  let itunes = new Itunes()
  let searchTerm = document.getElementById('search-input').value

  itunes.search(searchTerm).then((resp) => {
    let podcasts = resp.results.map((item) => {
      return new Podcast({
        id: item.collectionId,
        artwork: item.artworkUrl600,
        identity: item.artistName,
        title: item.collectionName,
        feed: item.feedUrl,
      })
    })

    let results = document.createElement('div')
    let foundPodcasts = searchResults(podcasts)

    let searchHeader = document.createElement('h2')
    searchHeader.innerText = `Showing search results for "${searchTerm}"`
    results.appendChild(searchHeader)
    results.appendChild(foundPodcasts)

    let debugEle = document.createElement('pre')
    debugEle.innerHTML = JSON.stringify( resp.results, null, 2 )
    // results.appendChild(debugEle)

    changeMainView(
      'searchResults',
      results
    )
  }).catch((err) => {
    console.error(err)
  })

  e.preventDefault()
  return false
});

function changeMainView(type, cont) {
  let view = document.getElementById('main-view')
  view.innerHTML = ''
  view.appendChild(cont)
}

function searchResults(podcasts) {
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
