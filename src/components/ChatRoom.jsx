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
    <div style={{ marginTop: '2rem' }}>
      {!connected ? (
        <div>
          <input
            placeholder="Nick gir"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
          />
          <button onClick={joinChat}>Katıl</button>
        </div>
      ) : (
        <div>
          <div
            style={{
              border: '1px solid #646cff',
              padding: '0.5rem',
              height: '200px',
              overflowY: 'auto',
              marginBottom: '0.5rem',
            }}
          >
            {messages.map((m, idx) => (
              <p key={idx}>
                <b>{m.nick}:</b> {m.text}
              </p>
            ))}
          </div>
          <input
            placeholder="Mesaj yaz"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Gönder</button>
        </div>
      )}
    </div>
  )
}
