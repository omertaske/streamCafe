import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

// Ortama göre socket server seçelim
const socket = io("https://streamcafe.onrender.com", { transports: ["websocket"] });

export default function ChatRoom() {
  const [nick, setNick] = useState('')
  const [connected, setConnected] = useState(false)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setMessages((prev) => [...prev, data])
    })
    return () => { socket.off('chatMessage') }
  }, [])

  const joinChat = () => {
    if (!nick) return
    socket.emit('setNick', nick, (res) => 
      res.success ? setConnected(true) : alert(res.message)
    )
  }

  const sendMessage = () => {
    if (msg.trim() === '') return
    socket.emit('chatMessage', msg)
    setMsg('')
  }

  return (
    <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl border border-indigo-700">
      {!connected ? (
        <div className="flex flex-col items-center gap-4">
          <input
            placeholder="Nick gir"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            className="px-4 py-3 rounded-2xl w-full text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={joinChat}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white font-semibold shadow-lg transition-all"
          >
            Katıl
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="h-72 overflow-y-auto p-4 border-2 border-indigo-600 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-inner scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700">
            {messages.map((m, idx) => (
              <p key={idx} className="mb-2">
                <b className="text-indigo-300">{m.nick}:</b> <span className="text-gray-200">{m.text}</span>
              </p>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              placeholder="Mesaj yaz"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-3 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white font-semibold shadow-lg transition-all"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
