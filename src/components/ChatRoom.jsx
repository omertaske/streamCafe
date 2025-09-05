import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001') // Backend URL

export default function ChatRoom() {
  const [nick, setNick] = useState('')
  const [connected, setConnected] = useState(false)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setMessages((prev) => [...prev, data])
    })
    return () => {
      socket.off('chatMessage')
    }
  }, [])

  const joinChat = () => {
    if (!nick) return
    socket.emit('setNick', nick, (res) => {
      if (res.success) setConnected(true)
      else alert(res.message)
    })
  }

  const sendMessage = () => {
    if (msg.trim() === '') return
    socket.emit('chatMessage', msg)
    setMsg('')
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      {!connected ? (
        <div className="flex flex-col items-center gap-3">
          <input
            placeholder="Nick gir"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            className="px-4 py-2 rounded-lg w-full text-black"
          />
          <button
            onClick={joinChat}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Katıl
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="h-64 overflow-y-auto p-3 border-2 border-indigo-500 rounded-lg bg-gray-900">
            {messages.map((m, idx) => (
              <p key={idx} className="mb-1">
                <b className="text-indigo-300">{m.nick}:</b> {m.text}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Mesaj yaz"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-2 rounded-lg text-black"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
