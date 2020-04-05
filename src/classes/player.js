class Player {
  constructor (url, opts = {}) {
    this._url = url
    this._playing = false
  }

  get playing () {
    return this._playing
  }

  set playing (state) {
    this._playing = state ? true : false
  }

  play () {
    this.playing = true
  }
}
