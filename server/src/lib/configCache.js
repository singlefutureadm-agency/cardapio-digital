const TTL_MS = 30_000

let _data = null
let _at   = 0

function get() {
  return _data && (Date.now() - _at) < TTL_MS ? _data : null
}

function set(data) {
  _data = data
  _at   = Date.now()
}

function invalidate() {
  _data = null
  _at   = 0
}

module.exports = { get, set, invalidate }
