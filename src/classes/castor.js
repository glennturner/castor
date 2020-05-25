/*
  This class is currently not in use because we're using a different pref db.

  @see `helpers/prefs.js`, which uses a flatfile DB instead of `localStorage`.
*/

class Castor {
  #prefKey = 'C-PRF'

  #defaultPrefs = {
    debugMenuOpts: false
  }

  constructor (argvs = {}) {
    this._initialize()
  }

  get prefs () {
    return JSON.parse(
      localStorage.getItem(this.#prefKey)
    ) || {}
  }

  set prefs (prefs) {
    localStorage.setItem(this.#prefKey,
      JSON.stringify(prefs)
    )
  }

  getPref (key) {
    return this.prefs[key]
  }

  setPref (key, val) {
    let prefs = this.prefs
    prefs[key] = val
    this.prefs = prefs
  }

  togglePref (key) {
    let val = this.getPref(key)
    val = val !== true

    this.setPref(key, val)
  }

  resetPrefs () {
    this.prefs = this.#defaultPrefs
  }

  _initialize () {
    if (!Object.keys(this.prefs).length) {
      this.resetPrefs()
    }
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = Castor
}
