import { SuperSelector } from '../libs/SuperSelector.js'

class PageSwitcher {
  constructor() {
    this.loginPage = new SuperSelector('body > main > div.login').element
    this.registerPage = new SuperSelector('body > main > div.register').element
    this.chatPage = new SuperSelector('body > main > div.chat').element
  }

  maskAll() {
    this.loginPage.mask('flex')
    this.registerPage.mask('flex')
    this.chatPage.mask('flex')
  }

  set(pageName) {
    this.maskAll()
    switch (pageName) {
      case 'login':
        this.loginPage.unmask()
        break
      case 'register':
        const captchaImgEl = document.querySelector('body > main > div.register img')
        captchaImgEl.setAttribute('src', '/api/captcha/generate')
        this.registerPage.unmask()
        break
      case 'chat':
        this.chatPage.unmask()
        break
      default:
        this.loginPage.unmask()
        break
    }
  }
}

export { PageSwitcher }
