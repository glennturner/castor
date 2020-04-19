// via https://gist.github.com/Facel3ss1/6e36392ff5b2603ee3f514ae6744cd1a
function checksum(s) {
  var hash = 0, strlen = s.length, i, c;
  if ( strlen === 0 ) {
    return hash;
  }
  for ( i = 0; i < strlen; i++ ) {
    c = s.charCodeAt( i );
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function sortByTitle (a, b) {
  return sortByProp('title', a, b)
}

function sortByProp (prop, a, b) {
  let propA = a[prop].toUpperCase()
  let propB = b[prop].toUpperCase()

  if (propA < propB) {
    return -1
  }

  if (propA > propB) {
    return 1
  }

  // names must be equal
  return 0
}
