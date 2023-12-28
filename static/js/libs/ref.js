export const ref = (value, cb) => {
  if (typeof value !== 'object') value = { value }
  return new Proxy(value, {
    get: (t, k) => t[k],
    set: (t, k, nv) => {
      cb(t[k], nv)
      t[k] = nv
      
      return true
    }
  })
}

