import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'streamadmin' // değiştir üretimde

const app = express()
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET','POST'],
  credentials: true
}))


app.use(express.json())

// serve uploads
app.use('/uploads', express.static(UPLOAD_DIR))

// In-memory state
let state = {
  live: false,
  casterUrl: '', // Caster.fm embed (admin setleyebilir)
  tracks: [], // { id, filename, title, uploadedAt, url }
}

// simple token store
const adminTokens = new Set()

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ''
    const id = crypto.randomBytes(6).toString('hex')
    cb(null, `${Date.now()}-${id}${ext}`)
  },
})
const upload = multer({ storage })

// helper: auth middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!token || !adminTokens.has(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' })
  next()
}

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(18).toString('hex')
    adminTokens.add(token)
    // token expires in 8 hours automatically remove (simple)
    setTimeout(() => adminTokens.delete(token), 8 * 3600 * 1000)
    return res.json({ ok: true, token })
  }
  return res.status(401).json({ ok: false, message: 'Wrong password' })
})

// Toggle live / set casterUrl
app.post('/api/admin/set-live', requireAdmin, (req, res) => {
  const { live, casterUrl } = req.body
  if (typeof live === 'boolean') state.live = live
  if (typeof casterUrl === 'string') state.casterUrl = casterUrl
  io.emit('stateUpdate', state) // notify clients
  return res.json({ ok: true, state })
})

// Upload track
app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' })
  const title = req.body.title || req.file.originalname
  const track = {
    id: crypto.randomBytes(8).toString('hex'),
    filename: req.file.filename,
    title,
    uploadedAt: Date.now(),
    url: `/uploads/${req.file.filename}`,
  }
  state.tracks.push(track)
  io.emit('stateUpdate', state)
  return res.json({ ok: true, track })
})

// Remove track
app.post('/api/admin/remove', requireAdmin, (req, res) => {
  const { id } = req.body
  const idx = state.tracks.findIndex(t => t.id === id)
  if (idx >= 0) {
    const [t] = state.tracks.splice(idx, 1)
    try { fs.unlinkSync(path.join(UPLOAD_DIR, t.filename)) } catch (e) {}
    io.emit('stateUpdate', state)
    return res.json({ ok: true })
  }
  return res.status(404).json({ ok: false, message: 'NotFound' })
})

// Public state
app.get('/api/state', (req, res) => {
  res.json({ ok: true, state })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

/* --- Socket.IO chat --- */
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

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
