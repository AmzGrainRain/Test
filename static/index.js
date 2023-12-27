const ref = (value, cb) => {
  if (typeof value !== 'object') value = { value }
  return new Proxy(value, {
    get: (t, k) => t[k],
    set: (t, k, nv) => {
        cb(t[k], nv)
        t[k] = nv
    }
  })
}
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const el = {
    register: $('nav input.register'),
    login: $('nav input.login'),
    logout: $('nav input.logout'),
    motd: $('nav span.motd'),
    content: $('div.content'),
    onlines: $('div.content p.onlines'),
    messages: $('div.content ul'),
    messageInputBox: $('div.content div.send input[type=text]'),
    sendMessage: $('div.content div.send input[type=button]'),
}

const loggedIn = ref(false, (ov, nv) => {
    if (nv) {
        el.content.style.display = 'block'
        el.login.style.display = 'none'
        el.register.style.display = 'none'
    }
    else {
        el.content.style.display = 'none'
        el.login.style.display = 'block'
        el.register.style.display = 'block'
    }
})
loggedIn.value = false
