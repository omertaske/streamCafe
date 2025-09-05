import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors()) // React frontend’den bağlantı için
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

let users = {}

io.on('connection', (socket) => {
  let currentNick = null

  socket.on('setNick', (nick, callback) => {
    if (users[nick]) {
      callback({ success: false, message: 'Bu nick alınmış!' })
    } else {
      currentNick = nick
      users[nick] = socket.id
      callback({ success: true })
      io.emit('userList', Object.keys(users))
    }
  })

  socket.on('chatMessage', (msg) => {
    if (currentNick) {
      io.emit('chatMessage', { nick: currentNick, text: msg })
    }
  })

  socket.on('disconnect', () => {
    if (currentNick) {
      delete users[currentNick]
      io.emit('userList', Object.keys(users))
    }
  })
})

server.listen(3001, () => {
  console.log('Chat server running on http://localhost:3001')
})
