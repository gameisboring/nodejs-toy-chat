// @ts-check

// IIFE
;(() => {
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
  const formEL = document.getElementById('form')
  const inputEL = document.getElementById('input')
  const chatsEL = document.getElementById('chats')

  if (!formEL || !inputEL) {
    throw new Error('Init failed !')
  }
  /**
   * @typedef Chat
   * @property {String} nickname
   * @property {String} message
   */

  /** @typedef {Chat[]} */
  const chats = []

  const adjectives = ['멋진', '훌륭한', '친절한', '새침한']
  const animal = ['사자', '호랑이', '사슴', '고래', '독수리']

  /**
   * @param {String[]} array
   * @returns {String}
   */
  function pickRandom(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    const result = array[randomIndex]
    if (!result) {
      throw new Error('array length is 0')
    }
    return result
  }

  const nickname = `${pickRandom(adjectives)} ${pickRandom(animal)}`

  formEL.addEventListener('submit', (event) => {
    event.preventDefault()
    socket.send(
      JSON.stringify({
        nickname: nickname,
        message: inputEL.value,
      })
    )
    inputEL.value = ''
  })

  const drawChats = () => {
    chats.forEach(({ message, nickname }) => {
      console.log()
      const div = document.createElement('div')
      div.innerText = `${nickname} : ${message}`
      chatsEL.appendChild(div)
    })
  }

  socket.addEventListener('message', (event) => {
    const { type, payload } = JSON.parse(event.data)
    if (type === 'sync') {
      const { chats: syncedChats } = payload
      chats.push(...syncedChats)
    } else if (type === 'chat') {
      const chat = payload
      chats.push(chat)
    }
    chatsEL.innerHTML = ''
    drawChats()
  })
})()
