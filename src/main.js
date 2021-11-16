// @ts-check

const Koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket')
const serve = require('koa-static')
const mount = require('koa-mount')
const Pug = require('koa-pug')
const path = require('path')
const mongoClient = require('./mongo')

// Template Engine : pug // CSS Framework : Tailwind

const app = websockify(new Koa())
// @ts-ignore

// pug 객체 선언 및 옵션 지정
new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app, // Binding `ctx.render()`, equals to pug.use(app)
})

// Using routes
app.ws.use(
  route.all('/ws', async (ctx) => {
    const chatsCollection = await getChatsCollection()
    const chatCursor = chatsCollection.find({}, { sort: { createdAt: 1 } })

    const chats = await chatCursor.toArray()
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        payload: {
          chats,
        },
      })
    )

    ctx.websocket.on('message', async function (data) {
      if (typeof data !== 'string') {
        return
      }
      /** @type {Chat} */
      const chat = JSON.parse(data)
      const chatsCollection = await getChatsCollection()
      await chatsCollection.insertOne({ ...chat, createdAt: new Date() })

      const { nickname, message } = chat

      const { server } = app.ws

      if (!server) {
        return
      }

      const stringMessage = JSON.stringify({
        type: 'chat',
        payload: {
          nickname,
          message,
        },
      })
      server.clients.forEach((client) => {
        client.send(stringMessage)
      })
    })
  })
)

app.use(mount('/public', serve('src/public')))

app.use(async (ctx) => {
  await ctx.render('main')
})

const _client = mongoClient.connect()

async function getChatsCollection() {
  const client = await _client
  return client.db('chat').collection('chats')
}
app.listen(3000)
