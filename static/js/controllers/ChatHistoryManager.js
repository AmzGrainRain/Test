class ChatHistoryManager {
  constructor() {
    this.chatHistoryList = document.querySelector('main > div.chat > ul.messages')
  }

  /**
   * 根据传入的变量生成 HTML 字符串 
   * @param {string} uid 用户 id
   * @param {number} ts 消息时间戳
   * @param {string} to 消息是给谁的
   * @param {string} message 消息内容
   * @returns HTML 字符串
   */
  generate(uid, ts, to, message) {
    return `<li data-to="${to}"><span>${uid} @ ${String(ts)}</span><p>${message}</p></li>`
  }

  /**
   * 向聊天列表追加消息
   * @param {string} uid 用户 id
   * @param {number} ts 消息时间戳
   * @param {string} to 消息是给谁的
   * @param {string} message 消息内容
   */
  append(uid, ts, to, message) {
    this.chatHistoryList.innerHTML += this.generate(uid, ts, to, message)
  }

  /**
   * 从云端加载聊天记录
   */
  fetchFromRemote() {}

  /**
   * 从本地加载聊天记录
   */
  loadFromLocal() {
    const chatHistory = localStorage.getItem('chat_history') || []
    if (chatHistory.length !== 0) {
      this.chatHistoryList.innerHTML = this.generate(
        '提示',
        String(Date.now()),
        'null',
        '正在从本地加载历史聊天记录...'
      )

      let htmlString = ''
      JSON.parse(chatHistory).forEach((item) => {
        htmlString += this.generate(item.uid, item.ts, item.to, item.message)
      })
      this.chatHistoryList.innerHTML = htmlString
    }
  }

  /**
   * 保存聊天记录到本地
   * @param {string} uid 用户 id
   * @param {number} ts 消息时间戳
   * @param {string} to 消息是给谁的
   * @param {string} message 消息内容
   */
  saveToLocal(uid, ts, to, message) {
    const chatHistory = localStorage.getItem('chat_history') || []
    chatHistory.push({ uid, ts: String(ts), to, message })
    localStorage.setItem('chat_history', JSON.stringify(chatHistory))
  }

  /**
   * 清空本地聊天记录
   */
  clearHistory() {
    localStorage.setItem('chat_history', '')
  }

  /**
   * 清空聊天记录列表
   */
  clear() {
    this.chatHistoryList.innerHTML = ``
  }
}

export { ChatHistoryManager }
