const fs = require('fs')
const os = require('os')

class Prefs {
  #fileEnc = 'utf-8'
  #prefType

  #defaultPrefs = {
    debugMenuOpts: false
  }

  constructor (prefType, argvs = {}) {
    this.#prefType = prefType || 'prefs'
    this._initialize()
  }

  prefDir () {
    return `${os.homedir()}/castor-data`
  }

  prefPath () {
    return `${this.prefDir()}/castor-app-${this.#prefType}.json`
  }

  get prefs () {
    return JSON.parse(
      fs.readFileSync(this.prefPath(), this.#fileEnc) || '{}'
    )
  }

  set prefs (prefs) {
    fs.writeFileSync(
      this.prefPath(), JSON.stringify(prefs)
    )
  }

  getPref (key) {
    return this.prefs[key]
  }

  setPref (key, val) {
    // Ignore whitespaced prefs, just to be safe.
    if (!this.#defaultPrefs[key]) { return }

    let prefs = this.prefs
    prefs[key] = val
    this.prefs = prefs
  }

  togglePref (key) {
    let val = this.getPref(key)
    console.log('ORI ' + key + ' VAL: ' + val)
    val = val !== true
    console.log('NEW ' + key + ' VAL: ' + val)

    this.setPref(key, val)
  }

  resetPrefs () {
    this.prefs = this.#defaultPrefs
  }

  _initialize () {
    this._initPrefFile()

    if (!Object.keys(this.prefs).length) {
      this.resetPrefs()
    }
  }

  _initPrefDir () {
    if (!fs.existsSync(this.prefDir())) {
      fs.mkdirSync(this.prefDir())
    }
  }

  _initPrefFile () {
    this._initPrefDir()

    if (!fs.existsSync(this.prefPath())) {
      fs.openSync(this.prefPath(), 'w')
    }
  }
}

module.exports = Prefs
