const MAX_LEN = 10

export class Logger {
  constructor (isActive) {
    this._count = 0
    this._isActive = isActive
    this._logs = []
    window.xplaLoggers = window.xplaLoggers || []
    window.xplaLoggers.push(this)
  }

  dump () {
    this._logs.forEach(this.printLog, this)
    return this._logs
  }

  addToLog (args) {
    this._count += 1
    args.unshift(`LOG #${this._count}`)
    this._logs.push(args)
    // clear old entries
    while (this._logs.length > MAX_LEN) {
      this._logs.shift()
    }
  }

  printLog (args) {
    console.debug(...args)
  }

  log (...args) {
    this.addToLog(args)

    if (this._isActive) {
      this.printLog(args)
    }
  }

  warn (...args) {
    console.warn(...args)
  }

  error (...args) {
    console.error(...args)
  }
}

let debugEnabled = false
try {
  debugEnabled = window.localStorage.xplaDebug
} catch (e) {}

export default new Logger(debugEnabled)
