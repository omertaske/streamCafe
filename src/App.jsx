import { useEffect, useState } from 'react'
import AudioPlayer from './components/AudioPlayer.jsx'
import ChatRoom from './components/ChatRoom.jsx'
import AdminPanel from './components/AdminPanel.jsx'

function App() {
  const [state, setState] = useState({ live: false, casterUrl: '', tracks: [] })

  useEffect(() => {
    fetch('https://streamcafe.onrender.com/api/state')
      .then(r => r.json())
      .then(json => { if (json.ok) setState(json.state) })
      .catch(console.error)
  }, [])

  if (window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-start">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-extrabold text-indigo-400 mb-8 text-center">StreamCafe — Admin</h1>
          <AdminPanel onStateChange={(s) => setState(s)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-300">StreamCafe</h1>
          <p className="text-gray-300 mt-1">Canlı yayın yakında </p>
        </header>

        <AudioPlayer state={state} setState={setState} />

        <main className="mt-8">
          <ChatRoom />
        </main>
      </div>
    </div>
  )
}

export default App
