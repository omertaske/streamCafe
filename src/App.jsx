import { useEffect, useState } from 'react'
import AudioPlayer from './components/AudioPlayer.jsx'
import ChatRoom from './components/ChatRoom.jsx'
import AdminPanel from './components/AdminPanel.jsx'

function App() {
const [state, setState] = useState({ live: false, casterUrl: '', tracks: [] })

  useEffect(() => {
    // fetch initial state
   fetch('http://localhost:3001/api/state')
  .then(r => r.json())
  .then(json => { if (json.ok) setState(json.state) })
  .catch(console.error)


    // socket.io state updates handled in AudioPlayer via polling/socket if needed
  }, [])

  // simple client-side path check: /admin -> admin panel
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-400 mb-6">StreamCafe — Admin</h1>
          <AdminPanel onStateChange={(s) => setState(s)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-300">StreamCafe</h1>
          <p className="text-sm text-gray-300">Canlı yayın / uploaded tracks — admin kontrolüyle</p>
        </header>

        <AudioPlayer state={state} setState={setState} />


        <main className="mt-6">
          <ChatRoom />
        </main>
      </div>
    </div>
  )
}

export default App
