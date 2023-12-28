class SuperSelector {
  /**
   * 选择元素
   * @param {string} selector CSS 选择器
   */
  constructor(selector) {
    this.element = document.querySelector(selector)
    this.registProperties()
    this.registFunction()
  }

  /**
   * 注册属性
   */
  registProperties() {
    this.element.computedStyle = getComputedStyle(this.element)
  }

  /**
   * 注册方法
   */
  registFunction() {
    this.element.show = () => (this.element.style.display = 'inline-block')
    this.element.hide = () => (this.element.style.display = 'none')
    
    this.element.mask = (display = this.element.computedStyle['display']) => {
      this.element.$origin_display = display
      this.element.hide()
    }

    this.element.unmask = () => {
      if (!this.element?.$origin_display) return
      this.element.style.display = this.element.$origin_display
    }
  }
}

export { SuperSelector }
