import { io } from './libs/socketio.js'
import { ref } from './libs/ref.js'
import { NavbarController } from './controllers/NavbarController.js'
import { PageSwitcher } from './controllers/PageSwitcher.js'
import { ChatHistoryManager } from './controllers/ChatHistoryManager.js'

// 导航栏控制器
const navbarController = new NavbarController()
// 页面切换器
const pageSwitcher = new PageSwitcher()
// 聊天记录管理器
const chatHistoryManager = new ChatHistoryManager()
let socketClient = null

/**
 * 登录状态
 */
const isLogin = ref(false, (ov, nv) => {
  if (nv) {
    navbarController.loggedIn()
    pageSwitcher.set('chat')
    socketConnect()
  } else {
    navbarController.notLogin()
    pageSwitcher.set('login')
  }
})
isLogin.value = false

/**
 * 在线人数
 */
const chatTitle = document.querySelector('main > div.chat > h2.title')
const onlines = ref(0, (ov, nv) => {
  chatTitle.innerHTML = `聊天室 | 当前有 ${nv} 人在线`
})
onlines.value = 0

/**
 * 连接到 socket 服务器
 */
const socketConnect = () => {
  socketClient = io()

  // 建立连接或重新连接时
  socketClient.on('connect', () => {
    navbarController.setMotd(`UID: ${socketClient.id}`)
    chatHistoryManager.loadFromLocal()
  })

  // 断开连接时
  socketClient.on('disconnect', () => {
    navbarController.setMotd('已断开连接')
  })

  // 有新的客户端接入时
  socketClient.on('client—join', (data) => {
    onlines.value = Number(data)
  })

  // 有客户端断开时
  socketClient.on('client-leave', (data) => {
    onlines.value = Number(data)
  })

  // 有新的消息时
  socketClient.on('new-message', (data) => {
    chatHistoryManager.append(data.uid, data.ts, data.to, data.message)
    chatHistoryManager.saveToLocal(data.uid, data.ts, data.to, data.message)
  })
}

/**
 * 发送消息
 * @param {socketClient} socketClient socket 客户端实例
 * @param {string} uid 用户 id
 * @param {string} to 消息发给谁？
 * @param {string} message 消息内容
 * @returns 空返回
 */
const sendMessage = (socketClient, uid, to, message) => {
  if (!socketClient || uid === -1) return
  socketClient.emit('send-message', {
    uid: this.uid,
    to,
    message
  })
}

/**
 * 导航栏注册按钮
 */
document.querySelector('body > nav input.register').addEventListener('click', (e) => {
  pageSwitcher.set('register')
})

/**
 * 导航登录按钮
 */
document.querySelector('body > nav input.login').addEventListener('click', (e) => {
  pageSwitcher.set('login')
})

/**
 * 导航注销登录按钮
 */
document.querySelector('body > nav input.logout').addEventListener('click', (e) => {
  fetch('/api/logout', {
    method: 'get'
  })
    .then((ori) => ori.json())
    .then((res) => {
      alert(res.message)
      pageSwitcher.set('login')
    })
})

/**
 * 注册
 */
document
  .querySelector('body > main > div.register > input[name=login]')
  .addEventListener('click', (e) => {
    const emailEl = document.querySelector('body > main > div.register input[name=email]')
    const passwordEl = document.querySelector('body > main > div.register input[name=password]')
    const confirmEl = document.querySelector('body > main > div.register input[name=confirm]')
    const captchaEl = document.querySelector('body > main > div.register input[name=captcha]')

    if (!emailEl.checkValidity()) {
      alert('无效的电子邮件地址')
      return
    }
    if (!passwordEl.checkValidity() || !confirmEl.checkValidity()) {
      alert('密码长度必须大于或等于 8 位')
      return
    }
    if (passwordEl.value !== confirmEl.value) {
      alert('两次输入的密码不一致')
      return
    }
    if (captchaEl.value.length !== 4) {
      alert('验证码格式错误')
      return
    }

    fetch('/api/register', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: emailEl.value,
        password: passwordEl.value,
        captcha: captchaEl.value
      })
    })
      .then((ori) => ori.json())
      .then((res) => {
        console.log(res)
      })
  })

/**
 * 登录
 */
document
  .querySelector('body > main > div.login > input[name=login]')
  .addEventListener('click', (e) => {
    const emailEl = document.querySelector('body > main > div.login > input[name=email]')
    const passwordEl = document.querySelector('body > main > div.login > input[name=password]')
    // const captchaEl = document.querySelector('body > main > div.login > input[name=captcha]')

    if (!emailEl.checkValidity()) {
      alert('无效的电子邮件地址')
      return
    }
    if (!passwordEl.checkValidity()) {
      alert('密码长度必须大于或等于 8 位')
      return
    }
    // if (!captchaEl.checkValidity()) {
    //   alert('验证码格式错误')
    //   return
    // }

    fetch('/api/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: emailEl.value, password: passwordEl.value })
    })
      .then((ori) => ori.json())
      .then((res) => {
        console.log(res)
      })
  })
