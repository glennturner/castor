document.getElementById('search').addEventListener('submit', (e) => {
  let itunes = new Itunes()
  let searchEle = document.getElementById('search-input').value

  itunes.search(searchEle).then((resp) => {
    console.log('RESULTS')
    console.log(resp.results)

    let podcasts = resp.results.map((item) => {
      return new Podcast({
        id: item.collectionId,
        artwork: item.artworkUrl600,
        identity: item.artistName,
        title: item.collectionName,
        feed: item.feedUrl,
      })
    })
    console.log('PODCASTS:')
    console.log(podcasts)

    let results = searchResults(podcasts)
    let debugEle = document.createElement('pre')
    debugEle.innerHTML = JSON.stringify( resp.results, null, 2 )
    results.appendChild(debugEle)

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
