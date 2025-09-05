import { useState } from 'react'
import './App.css'
import RadioPlayer from './components/RadioPlayer.jsx'
import ChatRoom from './components/ChatRoom.jsx'

function App() {
  const [casterUrl, setCasterUrl] = useState(null)
  // Eğer kendi Caster.fm embed URL’in varsa buraya ekle
  setCasterUrl('sapircast.caster.fm/15925')

  return (
    <div id="root">
      <h1>StreamCafe</h1>
      <RadioPlayer casterUrl={casterUrl} />
         <ChatRoom />
    </div>
  )
}

export default App
