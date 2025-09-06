import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import multer from "multer"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()

const app = express()

// ✅ CORS (en üstte, credentials: true YOK)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-token"]
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// --- Upload klasörü ---
const UPLOAD_DIR = path.join(process.cwd(), "uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

// --- Admin şifresi ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "streamadmin"

// --- State ---
let state = {
  live: false,
  casterUrl: "",
  tracks: []
}

// --- Token store ---
const adminTokens = new Set()

// --- Multer config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ""
    const id = crypto.randomBytes(6).toString("hex")
    cb(null, `${Date.now()}-${id}${ext}`)
  }
})
const upload = multer({ storage })

// --- Auth middleware ---
function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"]
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" })
  }
  next()
}

// --- Routes ---
app.use("/uploads", express.static(UPLOAD_DIR))

// Login
app.post("https://streamcafe.onrender.com/api/admin/login", (req, res) => {
  const { password } = req.body || {}
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(18).toString("hex")
    adminTokens.add(token)
    setTimeout(() => adminTokens.delete(token), 8 * 3600 * 1000) // 8 saat
    return res.json({ ok: true, token })
  }
  return res.status(401).json({ ok: false, message: "Wrong password" })
})

// Live toggle
app.post("https://streamcafe.onrender.com/api/admin/set-live", requireAdmin, (req, res) => {
  const { live, casterUrl } = req.body
  if (typeof live === "boolean") state.live = live
  if (typeof casterUrl === "string") state.casterUrl = casterUrl
  io.emit("stateUpdate", state)
  return res.json({ ok: true, state })
})

// Upload
app.post("https://streamcafe.onrender.com/api/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" })
  const title = req.body.title || req.file.originalname
  const track = {
    id: crypto.randomBytes(8).toString("hex"),
    filename: req.file.filename,
    title,
    uploadedAt: Date.now(),
    url: `/uploads/${req.file.filename}`
  }
  state.tracks.push(track)
  io.emit("stateUpdate", state)
  return res.json({ ok: true, track })
})

// Remove
app.post("https://streamcafe.onrender.com/api/admin/remove", requireAdmin, (req, res) => {
  const { id } = req.body
  const idx = state.tracks.findIndex(t => t.id === id)
  if (idx >= 0) {
    const [t] = state.tracks.splice(idx, 1)
    try { fs.unlinkSync(path.join(UPLOAD_DIR, t.filename)) } catch {}
    io.emit("stateUpdate", state)
    return res.json({ ok: true })
  }
  return res.status(404).json({ ok: false, message: "NotFound" })
})

// Public
app.get("https://streamcafe.onrender.com/api/state", (req, res) => {
  res.json({ ok: true, state })
})

// --- Socket.IO ---
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" }
})

let users = {}

io.on("connection", (socket) => {
  let currentNick = null

  socket.on("setNick", (nick, cb) => {
    if (users[nick]) {
      cb({ success: false, message: "Bu nick alınmış!" })
    } else {
      currentNick = nick
      users[nick] = socket.id
      cb({ success: true })
      io.emit("userList", Object.keys(users))
    }
  })

  socket.on("chatMessage", (msg) => {
    if (currentNick) {
      io.emit("chatMessage", { nick: currentNick, text: msg })
    }
  })

  socket.on("disconnect", () => {
    if (currentNick) {
      delete users[currentNick]
      io.emit("userList", Object.keys(users))
    }
  })
})

// --- Listen ---
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
