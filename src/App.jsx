import { useState } from 'react'
import RadioPlayer from './components/RadioPlayer.jsx'
import ChatRoom from './components/ChatRoom.jsx'

function App() {
  const [casterUrl] = useState('sapircast.caster.fm/15925')

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-400">StreamCafe</h1>
      <div className="w-full max-w-4xl">
        <RadioPlayer casterUrl={casterUrl} />
        <ChatRoom />
      </div>
    </div>
  )
}

export default App
