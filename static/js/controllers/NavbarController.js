import { SuperSelector } from '../libs/SuperSelector.js'

class NavbarController {
  constructor() {
    this.motd = document.querySelector('nav h1.motd')
    this.registerButton = new SuperSelector('nav input.register').element
    this.loginButton = new SuperSelector('nav input.login').element
    this.logoutButton = new SuperSelector('nav input.logout').element
  }

  /**
   * 将导航栏设置为未登录状态
   */
  notLogin() {
    this.registerButton.show()
    this.loginButton.show()
    this.logoutButton.hide()
  }

  /**
   * 将导航栏设置为已登录状态
   */
  loggedIn() {
    this.registerButton.hide()
    this.loginButton.hide()
    this.logoutButton.show()
  }

  /**
   * 更新导航栏的 MOTD 文字
   */
  setMotd(str) {
    this.motd.innerHTML = str
  }
}

export { NavbarController }
