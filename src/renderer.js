document.getElementById('search').addEventListener('submit', (e) => {
  let itunes = new Itunes();
  let searchEle = document.getElementById('search-input').value;

  itunes.search(searchEle).then((resp) => {
    console.log('RESULTS');
    console.log(resp.results);

    let podcasts = resp.results.map((item) => {
      return new Podcast({
        id: item.collectionId,
        artwork: item.artworkUrl600,
        identity: item.artistName,
        title: item.collectionName
      });
    });
    console.log('PODCASTS:');
    console.log(podcasts);

    let results = searchResults(podcasts);
    results += '<pre>' + JSON.stringify( resp.results, null, 2 ) + '</pre>';

    changeMainView(
      'searchResults',
      results
    );
  }).catch((err) => {
    console.error(err);
  })

  e.preventDefault();
  return false;
});

function changeMainView(type, cont) {
  let mainEle = document.getElementById('main-view');

  mainEle.innerHTML = '<div id="' + type + '">' + cont + '</div>';
}

function searchResults(podcasts) {
  let results = podcasts.map((podcast) => {
    return `
      <li
        class="show"
      >
        ${podcast.showHTML()}
      </li>
    `;
  });

  return `<ul class="search-results">${results}</ul>`;
}
